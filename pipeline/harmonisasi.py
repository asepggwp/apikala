"""
ApiKala — pipeline harmonisasi titik api MODIS–VIIRS (Indonesia)
NASA Space Apps Challenge 2026 · Tim Occupy Mars

Alur:
  1. UNDUH   : NASA FIRMS Country Yearly Summary (MODIS C6.1, VIIRS S-NPP, NOAA-20, NOAA-21);
               tahun yang belum ada arsipnya (mis. tahun berjalan) diambil lewat FIRMS API (MAP_KEY).
  2. SARING  : MODIS confidence >= 30; VIIRS confidence nominal/high; type = 0 (vegetasi) bila ada.
  3. AGREGAT : hitung titik per sel grid 0,25° × bulan × sensor.
  4. HARMONISASI (target = satuan "setara MODIS Terra+Aqua"):
       - Nov 2000–Jun 2002 hanya Terra  → dikali k_TA = Σ(Terra+Aqua)/ΣTerra (2003–2011)
       - bulan tanpa S-NPP              → VIIRS setara S-NPP = NOAA-20 × k_N20 (atau NOAA-21 × k_N21)
       - 2012 ke atas                   → H = VIIRS × k[pulau, bulan-kalender]
         k = ΣMODIS / ΣVIIRS pada tahun tumpang tindih (default 2012–2021, sebelum orbit
         Terra/Aqua bergeser), dengan selang kepercayaan bootstrap per tahun.
  5. VALIDASI: leave-one-year-out — k dihitung tanpa tahun y lalu dipakai menebak MODIS tahun y.
  6. EKSPOR  : web/data/grid.json + meta.json (dibaca web app).
"""
from __future__ import annotations

import io
import json
import os
import time
from datetime import date, timedelta

import numpy as np
import pandas as pd

FIRMS = "https://firms.modaps.eosdis.nasa.gov"
SUMBER = {
    # kode : (folder arsip tahunan, tahun mulai, sumber API SP, sumber API NRT)
    "MODIS": ("modis", 2000, "MODIS_SP", "MODIS_NRT"),
    "SNPP": ("viirs-snpp", 2012, "VIIRS_SNPP_SP", "VIIRS_SNPP_NRT"),
    "N20": ("viirs-jpss1", 2018, "VIIRS_NOAA20_SP", "VIIRS_NOAA20_NRT"),
    "N21": ("viirs-jpss2", 2024, None, "VIIRS_NOAA21_NRT"),
}
BBOX_IDN = "94,-11.5,141.5,6.5"
BULAN0 = (2000, 11)  # indeks bulan 0 = Nov 2000 (awal MODIS Terra)
AQUA_PENUH = (2002, 7)  # Aqua mulai Juli 2002


def idx_bulan(tahun, bulan):
    return (np.asarray(tahun) - BULAN0[0]) * 12 + (np.asarray(bulan) - BULAN0[1])


def label_bulan(i):
    t, b = divmod(BULAN0[1] - 1 + int(i), 12)
    return f"{BULAN0[0] + t}-{b + 1:02d}"


# ------------------------------------------------------------------ 1. UNDUH
class Pengunduh:
    def __init__(self, map_key: str | None, cache="cache", log=print):
        import requests  # tersedia di Colab

        self.s = requests.Session()
        self.key = map_key
        self.cache = cache
        self.log = log
        self.catatan = []  # asal-usul tiap potong data (dicatat di meta.json)
        os.makedirs(cache, exist_ok=True)

    def _get(self, url, timeout=180, coba=3):
        for i in range(coba):
            try:
                r = self.s.get(url, timeout=timeout)
                if r.status_code == 200:
                    return r.text
                if r.status_code in (400, 401, 403, 404):
                    return None
            except Exception as e:  # jaringan putus, dsb.
                self.log(f"   ! {e.__class__.__name__}, ulangi ({i + 1}/{coba})")
            time.sleep(3 * (i + 1))
        return None

    @staticmethod
    def _valid(txt):
        return txt is not None and txt.lstrip().lower().startswith("latitude")

    def tahunan(self, kode, tahun):
        folder = SUMBER[kode][0]
        url = f"{FIRMS}/data/country/{folder}/{tahun}/{folder}_{tahun}_Indonesia.csv"
        txt = self._get(url)
        return txt if self._valid(txt) else None

    def api(self, sumber, mulai: date, hari: int):
        if not (self.key and sumber):
            return None
        tgl = mulai.isoformat()
        for url in (
            f"{FIRMS}/api/country/csv/{self.key}/{sumber}/IDN/{hari}/{tgl}",
            f"{FIRMS}/api/area/csv/{self.key}/{sumber}/{BBOX_IDN}/{hari}/{tgl}",
        ):
            txt = self._get(url, timeout=120)
            if self._valid(txt):
                return txt
        return None

    def api_tahun(self, kode, tahun, sampai: date):
        """Satu tahun lewat API per jendela 5 hari: coba SP dulu, lalu NRT."""
        _, _, sp, nrt = SUMBER[kode]
        d, akhir = date(tahun, 1, 1), min(date(tahun, 12, 31), sampai)
        potong, n_sp, n_nrt = [], 0, 0
        while d <= akhir:
            hari = min(5, (akhir - d).days + 1)
            txt = self.api(sp, d, hari)
            if txt is not None and txt.count("\n") > 1:
                n_sp += 1
            else:
                txt = self.api(nrt, d, hari)
                n_nrt += txt is not None
            if txt is not None:
                potong.append(pd.read_csv(io.StringIO(txt)))
            d += timedelta(days=hari)
            time.sleep(0.3)
        self.catatan.append(dict(sensor=kode, tahun=tahun, asal="API", jendela_SP=n_sp, jendela_NRT=n_nrt))
        return pd.concat(potong, ignore_index=True) if potong else None


# ------------------------------------------------------------------ 2–3. SARING & AGREGAT
class Grid:
    def __init__(self, cells: dict):
        self.res, self.lon0, self.lat0 = cells["res"], cells["lon0"], cells["lat0"]
        self.ncol, self.nrow = cells["ncol"], cells["nrow"]
        self.sel_prov = {int(k): v for k, v in cells["sel"].items()}
        self.prov_pulau = cells["pulau_provinsi"]
        self.pulau = cells["pulau"]

    def sel(self, lon, lat):
        c = np.floor((np.asarray(lon) - self.lon0) / self.res).astype(int)
        r = np.floor((np.asarray(lat) - self.lat0) / self.res).astype(int)
        ok = (c >= 0) & (c < self.ncol) & (r >= 0) & (r < self.nrow)
        return np.where(ok, r * self.ncol + c, -1)

    def pulau_sel(self, sel):
        return np.array([self.prov_pulau[self.sel_prov[s]] for s in sel])


def saring_agregat(df: pd.DataFrame, kode: str, grid: Grid) -> pd.DataFrame:
    """Kembalikan tabel (sel, m, sensor, n). Sensor: MT/MA untuk MODIS Terra/Aqua."""
    if df is None or df.empty:
        return pd.DataFrame(columns=["sel", "m", "sensor", "n"])
    df = df.rename(columns=str.lower)
    awal = len(df)
    conf = df["confidence"]
    if kode == "MODIS":
        ok = pd.to_numeric(conf, errors="coerce").fillna(0) >= 30
    else:
        ok = conf.astype(str).str.strip().str.lower().str[0].isin(["n", "h"])
    if "type" in df:
        ok &= pd.to_numeric(df["type"], errors="coerce").fillna(0).astype(int) == 0
    df = df[ok]
    sel = grid.sel(df["longitude"].to_numpy(), df["latitude"].to_numpy())
    di_idn = np.isin(sel, list(grid.sel_prov))
    df = df[di_idn].assign(sel=sel[di_idn])
    tgl = pd.to_datetime(df["acq_date"])
    df = df.assign(m=idx_bulan(tgl.dt.year.to_numpy(), tgl.dt.month.to_numpy()))
    if kode == "MODIS":
        sat = df["satellite"].astype(str).str.upper().str[0]
        df = df.assign(sensor=np.where(sat == "T", "MT", "MA"))
    else:
        df = df.assign(sensor=kode)
    out = df.groupby(["sel", "m", "sensor"]).size().rename("n").reset_index()
    out.attrs["saring"] = (awal, int(ok.sum()), len(df))
    return out


def kumpulkan(map_key, cells, tahun_akhir=None, cache="cache", log=print, offline_dir=None):
    """Unduh + saring + agregat semua sensor. Hasil per (sensor,tahun) disimpan di cache."""
    grid = Grid(cells)
    hari_ini = date.today()
    os.makedirs(cache, exist_ok=True)
    tahun_akhir = tahun_akhir or hari_ini.year
    dl = None if offline_dir else Pengunduh(map_key, cache, log)
    potong, catatan = [], []
    for kode, (folder, t0, _, _) in SUMBER.items():
        for th in range(t0, tahun_akhir + 1):
            fc = os.path.join(cache, f"agg_{kode}_{th}.csv")
            if os.path.exists(fc) and th < hari_ini.year:
                agg = pd.read_csv(fc)
                potong.append(agg)
                catatan.append(dict(sensor=kode, tahun=th, asal="cache", baris=int(agg["n"].sum())))
                continue
            df, asal = None, None
            if offline_dir:
                p = os.path.join(offline_dir, f"{folder}_{th}_Indonesia.csv")
                if os.path.exists(p):
                    df, asal = pd.read_csv(p), "arsip-tahunan"
            else:
                txt = dl.tahunan(kode, th)
                if txt is not None:
                    df, asal = pd.read_csv(io.StringIO(txt)), "arsip-tahunan"
                elif th >= hari_ini.year - 1:
                    log(f"   {kode} {th}: arsip tahunan belum ada → FIRMS API (per 5 hari)")
                    df, asal = dl.api_tahun(kode, th, hari_ini), "API"
                else:
                    log(f"   {kode} {th}: arsip tahunan TIDAK ditemukan (dilewati)")
            if df is None:
                log(f"   {kode} {th}: tidak ada data")
                catatan.append(dict(sensor=kode, tahun=th, asal="tidak-ada", baris=0))
                continue
            agg = saring_agregat(df, kode, grid)
            awal, lolos, idn = agg.attrs.get("saring", (len(df), 0, 0))
            log(f"   {kode} {th}: {awal:>9,} titik → lolos saring {lolos:>9,} → di sel Indonesia {idn:>9,}  ({asal})")
            agg.to_csv(fc, index=False)
            potong.append(agg)
            catatan.append(dict(sensor=kode, tahun=th, asal=asal, baris_mentah=int(awal),
                                lolos_saring=int(lolos), baris=int(idn)))
    if dl:
        catatan += dl.catatan
    tabel = pd.concat(potong, ignore_index=True)
    return tabel, catatan, grid


# ------------------------------------------------------------------ 4. HARMONISASI
def rasio(a, b):
    a, b = float(np.sum(a)), float(np.sum(b))
    return a / b if b > 0 else np.nan


def bootstrap_k(per_tahun: pd.DataFrame, num="M", den="V", n=500, rng=None):
    """CI 95% rasio ΣM/ΣV dengan resampling tahun (menangkap variasi antar-tahun)."""
    rng = rng or np.random.default_rng(42)
    a, b = per_tahun[num].to_numpy(float), per_tahun[den].to_numpy(float)
    if len(a) < 3 or b.sum() == 0:
        return np.nan, np.nan
    idx = rng.integers(0, len(a), size=(n, len(a)))
    ks = a[idx].sum(1) / np.maximum(b[idx].sum(1), 1e-9)
    return float(np.percentile(ks, 2.5)), float(np.percentile(ks, 97.5))


def harmonisasi(tabel: pd.DataFrame, grid: Grid, overlap=(2012, 2021), min_viirs=300, log=print):
    # tabel lebar: sel × m × sensor
    lebar = tabel.pivot_table(index=["sel", "m"], columns="sensor", values="n", aggfunc="sum", fill_value=0)
    for c in ["MT", "MA", "SNPP", "N20", "N21"]:
        if c not in lebar:
            lebar[c] = 0
    lebar = lebar.reset_index()
    lebar["pulau"] = grid.pulau_sel(lebar["sel"].to_numpy())
    lebar["tahun"] = BULAN0[0] + (lebar["m"] + BULAN0[1] - 1) // 12
    lebar["bulan"] = (lebar["m"] + BULAN0[1] - 1) % 12 + 1

    # total nasional per bulan → tahu bulan mana tiap sensor aktif
    nas = lebar.groupby("m")[["MT", "MA", "SNPP", "N20", "N21"]].sum()

    # (a) Terra-only → Terra+Aqua
    m_aqua = int(idx_bulan(*AQUA_PENUH))
    ref = lebar[(lebar["tahun"] >= 2003) & (lebar["tahun"] <= 2011)]
    k_TA = rasio(ref["MT"] + ref["MA"], ref["MT"])
    lebar["M"] = (lebar["MT"] + lebar["MA"]).astype(float)
    pre = lebar["m"] < m_aqua
    lebar.loc[pre, "M"] = lebar.loc[pre, "MT"] * k_TA

    # (b) NOAA-20 / NOAA-21 → setara S-NPP (bulan yang ketiganya aktif)
    def k_jembatan(kol):
        bulan_ok = nas.index[(nas["SNPP"] > 0) & (nas[kol] > 0)]
        sub = lebar[lebar["m"].isin(bulan_ok)]
        return rasio(sub["SNPP"], sub[kol]), int(len(bulan_ok))

    k_N20, nb20 = k_jembatan("N20")
    k_N21, nb21 = k_jembatan("N21")
    # bulan S-NPP dipakai hanya bila cakupannya penuh (S-NPP berhenti 2 Nov 2026: bulan itu → NOAA-20)
    snpp_aktif = set(nas.index[(nas["SNPP"] > 0) & ((nas["N20"] == 0) | (nas["SNPP"] >= 0.5 * nas["N20"]))])
    n20_aktif = set(nas.index[nas["N20"] > 0])
    sumber_v = {}
    V = lebar["SNPP"].astype(float).to_numpy().copy()
    for m in sorted(set(lebar["m"])):
        if m in snpp_aktif:
            sumber_v[m] = "SNPP"
        elif m in n20_aktif and np.isfinite(k_N20):
            sumber_v[m] = "N20"
        elif nas.loc[m, "N21"] > 0 and np.isfinite(k_N21):
            sumber_v[m] = "N21"
    mm = lebar["m"].to_numpy()
    for kol, k in (("N20", k_N20), ("N21", k_N21)):
        pakai = np.array([sumber_v.get(m) == kol for m in mm])
        V[pakai] = lebar[kol].to_numpy()[pakai] * k
    lebar["V"] = V

    # (c) faktor utama k[pulau, bulan] = ΣM / ΣV pada tahun tumpang tindih
    ov = lebar[(lebar["tahun"] >= overlap[0]) & (lebar["tahun"] <= overlap[1])]
    rng = np.random.default_rng(42)
    baris_k = []
    k_nas_bulan = {}
    for b in range(1, 13):
        sub = ov[ov["bulan"] == b]
        k_nas_bulan[b] = rasio(sub["M"], sub["V"])
    k_nas = rasio(ov["M"], ov["V"])
    for p_i, p in enumerate(grid.pulau):
        sp = ov[ov["pulau"] == p_i]
        k_pulau = rasio(sp["M"], sp["V"]) if sp["V"].sum() >= min_viirs else k_nas
        for b in range(1, 13):
            sb = sp[sp["bulan"] == b]
            pt = sb.groupby("tahun")[["M", "V"]].sum()
            if sb["V"].sum() >= min_viirs:
                k, metode = rasio(sb["M"], sb["V"]), "pulau-bulan"
            elif sp["V"].sum() >= min_viirs:
                k, metode = k_pulau, "pulau-tahunan"
                pt = sp.groupby("tahun")[["M", "V"]].sum()
            else:
                k, metode = k_nas_bulan[b], "nasional-bulan"
                pt = ov[ov["bulan"] == b].groupby("tahun")[["M", "V"]].sum()
            lo, hi = bootstrap_k(pt, rng=rng)
            baris_k.append(dict(pulau=p, bulan=b, k=round(k, 4), ci_lo=round(lo, 4), ci_hi=round(hi, 4),
                                metode=metode, n_viirs=int(sb["V"].sum()), n_modis=int(round(sb["M"].sum()))))
    ktab = pd.DataFrame(baris_k)
    K = {(r.pulau, r.bulan): r.k for r in ktab.itertuples()}
    m_v0 = min(snpp_aktif) if snpp_aktif else 10**9
    kk = np.array([K[(grid.pulau[p], b)] for p, b in zip(lebar["pulau"], lebar["bulan"])])
    lebar["H"] = np.where(lebar["m"] >= m_v0, lebar["V"] * kk, lebar["M"])

    log(f"   k_TA (Terra→Terra+Aqua) = {k_TA:.3f} | k_N20→SNPP = {k_N20:.3f} ({nb20} bln) | "
        f"k_N21→SNPP = {k_N21:.3f} ({nb21} bln) | k nasional = {k_nas:.3f}")
    info = dict(k_TA=k_TA, k_N20=k_N20, k_N21=k_N21, k_nasional=k_nas, overlap=list(overlap),
                bulan_mulai_viirs=label_bulan(m_v0), bulan_aqua=label_bulan(m_aqua),
                sumber_viirs_per_bulan={label_bulan(m): s for m, s in sumber_v.items() if s != "SNPP"})
    return lebar, ktab, info


# ------------------------------------------------------------------ 5. VALIDASI
def validasi(lebar: pd.DataFrame, grid: Grid, overlap=(2012, 2021)):
    """Leave-one-year-out pada tingkat pulau × bulan, dibandingkan dengan VIIRS mentah."""
    ov = lebar[(lebar["tahun"] >= overlap[0]) & (lebar["tahun"] <= overlap[1]) & (lebar["m"] >= lebar.loc[lebar["SNPP"] > 0, "m"].min())]
    agg = ov.groupby(["pulau", "tahun", "bulan"])[["M", "V"]].sum().reset_index()
    pred = []
    for y in sorted(agg["tahun"].unique()):
        latih, uji = agg[agg["tahun"] != y], agg[agg["tahun"] == y]
        kb = latih.groupby(["pulau", "bulan"])[["M", "V"]].sum()
        kp = latih.groupby("pulau")[["M", "V"]].sum()
        for r in uji.itertuples():
            mv = kb.loc[(r.pulau, r.bulan)] if (r.pulau, r.bulan) in kb.index else None
            if mv is not None and mv["V"] >= 300:
                k = mv["M"] / mv["V"]
            else:
                k = kp.loc[r.pulau, "M"] / max(kp.loc[r.pulau, "V"], 1)
            pred.append(dict(pulau=grid.pulau[r.pulau], tahun=r.tahun, bulan=r.bulan,
                             modis=r.M, viirs_mentah=r.V, harmonis=r.V * k))
    p = pd.DataFrame(pred)

    def metrik(d):
        d = d[d["modis"] >= 20]
        if len(d) < 3:
            return None
        out = {}
        for nama, col in (("harmonis", "harmonis"), ("viirs_mentah", "viirs_mentah")):
            e = d[col] - d["modis"]
            ss = ((d["modis"] - d["modis"].mean()) ** 2).sum()
            out[nama] = dict(
                r=round(float(np.corrcoef(d["modis"], d[col])[0, 1]), 3),
                r2=round(float(1 - (e ** 2).sum() / ss), 3) if ss > 0 else None,
                bias_pct=round(float(100 * e.sum() / d["modis"].sum()), 1),
                mape_pct=round(float(100 * (e.abs() / d["modis"]).median()), 1),
            )
        out["n_bulan"] = int(len(d))
        return out

    hasil = {"Indonesia (pulau×bulan)": metrik(p)}
    for nama in grid.pulau:
        hasil[nama] = metrik(p[p["pulau"] == nama])
    nas = p.groupby(["tahun", "bulan"])[["modis", "viirs_mentah", "harmonis"]].sum().reset_index()
    hasil["Indonesia (nasional×bulan)"] = metrik(nas.assign(pulau="Indonesia"))
    return hasil, p


# ------------------------------------------------------------------ 6. EKSPOR
def _bersih(x):
    """NaN/inf → null, tipe numpy → tipe Python (agar JSON valid untuk peramban)."""
    if isinstance(x, dict):
        return {str(k): _bersih(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [_bersih(v) for v in x]
    if isinstance(x, (np.integer,)):
        return int(x)
    if isinstance(x, (float, np.floating)):
        return float(x) if np.isfinite(x) else None
    return x


def ekspor(lebar, ktab, info, val, catatan, cells, keluar="web/data", filters=None):
    os.makedirs(keluar, exist_ok=True)
    n_bulan = int(lebar["m"].max()) + 1
    # grid.json: per sel, deret jarang [m, M, V, m, M, V, ...] (H dihitung ulang di peramban)
    g = {}
    for sel, d in lebar[(lebar["M"] > 0) | (lebar["V"] > 0)].sort_values("m").groupby("sel"):
        arr = np.column_stack([d["m"], np.round(d["M"], 1), np.round(d["V"], 1)]).ravel().tolist()
        g[str(int(sel))] = [int(x) if float(x).is_integer() else x for x in arr]
    json.dump(dict(bulan0=label_bulan(0), n_bulan=n_bulan, sel=g),
              open(os.path.join(keluar, "grid.json"), "w"), separators=(",", ":"))
    ksel = {p: [None] * 12 for p in ktab["pulau"].unique()}
    for r in ktab.itertuples():
        ksel[r.pulau][r.bulan - 1] = r.k
    meta = dict(
        dibuat=pd.Timestamp.now(tz="UTC").strftime("%Y-%m-%d %H:%M UTC"),
        tanggal_data=date.today().isoformat(),
        bulan_awal=label_bulan(0), bulan_akhir=label_bulan(n_bulan - 1),
        k=ksel, k_detail=ktab.to_dict("records"),
        k_TA=round(info["k_TA"], 4), k_N20=round(info["k_N20"], 4) if np.isfinite(info["k_N20"]) else None,
        k_N21=round(info["k_N21"], 4) if np.isfinite(info["k_N21"]) else None,
        k_nasional=round(info["k_nasional"], 4), overlap=info["overlap"],
        bulan_mulai_viirs=info["bulan_mulai_viirs"], bulan_aqua=info["bulan_aqua"],
        sumber_viirs_pengganti=info["sumber_viirs_per_bulan"],
        validasi=val, saringan=filters or {}, asal_data=catatan,
        sumber=["NASA FIRMS — MODIS Collection 6.1 (MCD14) active fire, Terra & Aqua",
                "NASA FIRMS — VIIRS 375 m (VNP14IMG/VJ114IMG/VJ214IMG) S-NPP, NOAA-20, NOAA-21",
                "geoBoundaries IDN ADM1 (CC BY 4.0)"],
    )
    json.dump(_bersih(meta), open(os.path.join(keluar, "meta.json"), "w"), ensure_ascii=False, indent=1,
              allow_nan=False)
    json.dump(cells, open(os.path.join(keluar, "cells.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    ukuran = {f: os.path.getsize(os.path.join(keluar, f)) // 1024 for f in ("grid.json", "meta.json", "cells.json")}
    return ukuran


def jalankan(map_key, cells, keluar="web/data", cache="cache", overlap=(2012, 2021), offline_dir=None, log=print):
    log("1–3. Unduh, saring, agregat …")
    tabel, catatan, grid = kumpulkan(map_key, cells, cache=cache, log=log, offline_dir=offline_dir)
    log("4. Harmonisasi …")
    lebar, ktab, info = harmonisasi(tabel, grid, overlap=overlap, log=log)
    log("5. Validasi leave-one-year-out …")
    val, pred = validasi(lebar, grid, overlap=overlap)
    log(json.dumps(val.get("Indonesia (pulau×bulan)"), indent=1))
    log("6. Ekspor …")
    filt = {"MODIS": "confidence >= 30, type = 0", "VIIRS": "confidence nominal/high, type = 0",
            "grid": "0,25° (±28 km)", "wilayah": "sel yang dipetakan ke 34 provinsi (geoBoundaries)"}
    ukuran = ekspor(lebar, ktab, info, val, catatan, cells, keluar=keluar, filters=filt)
    log(f"   selesai: {ukuran} KB")
    return lebar, ktab, info, val, pred
