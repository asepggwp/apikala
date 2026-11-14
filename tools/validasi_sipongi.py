"""Validasi eksternal: titik api harmonis ApiKala vs luas karhutla resmi SIPONGI KEMENHUT (2018–2026).
Pakai: python tools/validasi_sipongi.py  → docs/data/sipongi.json
"""
import csv, json, math, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "docs/data")
meta = json.load(open(f"{D}/meta.json")); grid = json.load(open(f"{D}/grid.json")); cells = json.load(open(f"{D}/cells.json"))

# SiPongi (38 provinsi baru) → 34 provinsi geoBoundaries
GABUNG = {"Bangka Belitung": "Kep. Bangka Belitung", "Yogyakarta": "DI Yogyakarta", "Papua Selatan": "Papua",
          "Papua Tengah": "Papua", "Papua Pegunungan": "Papua", "Papua Barat Daya": "Papua Barat"}
TAHUN = list(range(2018, 2027))
luas = {}
with open(f"{ROOT}/data/sipongi_luas_karhutla_2018_2026.csv", encoding="utf-8") as f:
    rows = [r for r in csv.reader(l for l in f if not l.startswith("#"))]
for r in rows[1:]:
    p = GABUNG.get(r[1], r[1]); assert p in cells["provinsi"], r[1]
    for i, y in enumerate(TAHUN):
        luas.setdefault(p, {}).setdefault(y, 0.0); luas[p][y] += float(r[2 + i])

# titik api harmonis per provinsi × tahun (2026: Jan–Jul, sesuai input SiPongi)
y0, m0 = map(int, grid["bulan0"].split("-")); vy, vm = map(int, meta["bulan_mulai_viirs"].split("-"))
mv0 = (vy - y0) * 12 + (vm - m0)
H, H7 = {}, {}
for sid, d in grid["sel"].items():
    pi = cells["sel"][sid]; p = cells["provinsi"][pi]; pul = cells["pulau"][cells["pulau_provinsi"][pi]]
    for j in range(0, len(d), 3):
        i = d[j]; z = m0 - 1 + i; y = y0 + z // 12; mo = z % 12 + 1
        h = d[j + 2] * meta["k"][pul][mo - 1] if i >= mv0 else d[j + 1]
        H.setdefault(p, {}).setdefault(y, 0.0); H[p][y] += h
        if mo <= 7:
            H7.setdefault(p, {}).setdefault(y, 0.0); H7[p][y] += h

def pearson(a, b):
    n = len(a); ma, mb = sum(a) / n, sum(b) / n
    sa = math.sqrt(sum((x - ma) ** 2 for x in a)); sb = math.sqrt(sum((x - mb) ** 2 for x in b))
    return sum((x - ma) * (y - mb) for x, y in zip(a, b)) / (sa * sb)

def spearman(a, b):
    rk = lambda v: [sorted(v).index(x) + (v.count(x) - 1) / 2 for x in v]
    return pearson(rk(a), rk(b))

LENGKAP = list(range(2018, 2025))  # 2025 tampak belum lengkap di SiPongi; 2026 hanya s.d. Juli
pts = []
for p in cells["provinsi"]:
    for y in LENGKAP:
        a, h = luas.get(p, {}).get(y, 0), H.get(p, {}).get(y, 0)
        if a > 0 and h > 0:
            pts.append(dict(p=p, y=y, ha=round(a, 1), h=round(h, 1)))
for p in cells["provinsi"]:
    a, h = luas.get(p, {}).get(2026, 0), H7.get(p, {}).get(2026, 0)
    if a > 0 and h > 0:
        pts.append(dict(p=p, y=2026, ha=round(a, 1), h=round(h, 1), jan_jul=True))
lp = [p for p in pts if p["y"] in LENGKAP]
r_log = pearson([math.log10(p["h"]) for p in lp], [math.log10(p["ha"]) for p in lp])
rho = spearman([p["h"] for p in lp], [p["ha"] for p in lp])
nas = [dict(y=y, ha=round(sum(luas[p][y] for p in luas)), h=round(sum(H[p].get(y, 0) for p in H)),
            h_jan_jul=round(sum(H7[p].get(y, 0) for p in H7))) for y in TAHUN]
r_nas = pearson([n["h"] for n in nas if n["y"] in LENGKAP], [n["ha"] for n in nas if n["y"] in LENGKAP])
j7 = {n["y"]: n["h_jan_jul"] for n in nas}
ha = {n["y"]: n["ha"] for n in nas}
# SiPongi 2026 hanya s.d. Juli → pakai perbandingan Jan–Jul yang dinyatakan di halaman SiPongi sendiri
SIPONGI_JANJUL = {2019: 47, 2023: 80, 2025: 69}  # "% peningkatan Jan–Jul 2026 dibanding tahun itu" (halaman SiPongi)
banding = {str(y): dict(sipongi_pct=v, apikala_pct=round(100 * (j7[2026] / j7[y] - 1))) for y, v in SIPONGI_JANJUL.items()}
out = dict(sumber="SIPONGI KEMENHUT — Rekapitulasi Luas Kebakaran Hutan dan Lahan (Ha) per Provinsi; 2026 s.d. Juli 2026",
           url="https://sipongi.gakkum.kehutanan.go.id/indikasi-luas-kebakaran",
           tahun_uji=LENGKAP, n=len(lp), r_log=round(r_log, 3), spearman=round(rho, 3), r_nasional=round(r_nas, 3),
           nasional=nas, banding_2026=banding, titik=pts,
           catatan_en="2025 excluded: the 2025 column of the SiPongi table (12,227 ha) contradicts the note on the same page "
                      "(Jan–Jul 2025 ≈ 119,213 ha), so it is probably incomplete. New Papua provinces are merged into Papua / "
                      "Papua Barat to match the 34 geoBoundaries provinces.",
           catatan="2025 dikecualikan: kolom 2025 tabel SiPongi (12.227 ha) bertentangan dengan catatan di halaman yang sama "
                   "(Jan–Jul 2025 ≈ 119.213 ha), jadi kemungkinan belum lengkap. "
                   "Provinsi pemekaran Papua digabung ke Papua / Papua Barat agar cocok dengan 34 batas geoBoundaries.")
json.dump(out, open(f"{D}/sipongi.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(f"n={len(lp)} r(log)={r_log:.3f} spearman={rho:.3f} r_nasional={r_nas:.3f}")
for n in nas: print(n)
print(banding)
