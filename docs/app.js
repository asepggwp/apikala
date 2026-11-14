/* ApiKala — web app (tanpa framework).
   Data: data/grid.json (deret jarang per sel 0,25°), data/meta.json (faktor k, validasi), data/cells.json, data/provinsi.geojson */
"use strict";

// ---------------------------------------------------------------- teks ID / EN
const T = {
  id: {
    tagline: "Satu catatan titik api yang konsisten sejak 2000: MODIS + VIIRS diharmonisasi",
    problem: "Petugas karhutla perlu tahu: <b>apakah titik api di wilayahnya bulan ini tidak biasa, dan kapan musim rawannya?</b> Catatan satelit 20+ tahun terpecah di dua sensor yang angkanya tidak sebanding — VIIRS (375 m) mencatat jauh lebih banyak titik daripada MODIS (1 km) untuk kebakaran yang sama. Aplikasi ini menyamakan keduanya ke satu satuan (<b>setara MODIS</b>), lalu menyajikannya sebagai kalender.",
    h_area: "1. Pilih wilayah", tab_prov: "Provinsi", tab_box: "Gambar kotak", tab_pt: "Koordinat",
    lbl_prov: "Provinsi / pulau", hint_prov: "Atau klik provinsi di peta.",
    btn_draw: "✏️ Mulai gambar kotak", btn_draw_on: "Seret di peta… (klik untuk batal)",
    hint_box: "Klik tombol, lalu tekan-dan-seret di peta untuk menggambar area.",
    lbl_lat: "Lintang", lbl_lon: "Bujur", lbl_rad: "Radius (km)", btn_pt: "Terapkan",
    h_range: "2. Rentang tahun", lbl_from: "Dari", lbl_to: "Sampai", area: "Wilayah",
    h_cal: "Kalender aktivitas api", v_count: "Jumlah titik", v_anom: "Anomali vs median", show_num: "tampilkan angka",
    cal_note: "Setiap kotak = jumlah titik api (setara MODIS) dalam satu bulan. Arahkan kursor untuk rincian per sensor.",
    cal_note_anom: "Warna = selisih terhadap median bulan yang sama (seluruh tahun lengkap). Merah = lebih banyak dari biasanya, biru = lebih sedikit.",
    h_season: "Musim api: median per bulan", season_note: "Batang = median tahun terpilih, garis = rentang 25–75%, titik = tahun yang disorot.",
    lbl_hl: "Sorot tahun", h_year: "Total per tahun", year_note: "Batang = hasil harmonisasi; garis abu-abu = MODIS mentah. Centang untuk melihat seberapa jauh VIIRS mentah melenceng tanpa harmonisasi.",
    h_dl: "Unduh data", dl1_t: "Tabel bulanan wilayah ini (CSV)",
    dl1_d: "Per bulan: MODIS mentah, VIIRS mentah, faktor k, nilai harmonis, median, anomali.", dl1_b: "⬇ Unduh CSV bulanan",
    dl2_t: "Titik api mentah dari NASA FIRMS (CSV)",
    dl2_d: "Ambil titik api asli untuk wilayah & tanggal pilihan langsung dari FIRMS API. Butuh MAP_KEY gratis milik Anda (tidak disimpan).",
    dl2_b: "⬇ Ambil & unduh titik api", lbl_src: "Sensor", h_method: "Bagaimana harmonisasinya?",
    foot: "Data: NASA FIRMS (MODIS C6.1, VIIRS 375 m S-NPP/NOAA-20/NOAA-21), batas provinsi geoBoundaries (CC BY 4.0), peta dasar © kontributor OpenStreetMap. Dibuat oleh Tim Occupy Mars untuk NASA Space Apps Challenge 2026. NASA tidak mendukung (endorse) proyek ini.",
    all_idn: "Seluruh Indonesia", island: "Pulau", province: "Provinsi", box: "Kotak gambar", circle: "Radius",
    cells: "sel grid", t_total: "Total titik api", t_total_d: "setara MODIS, {a}–{b}",
    t_peak: "Puncak musim api", t_peak_d: "bulan dengan median tertinggi",
    t_worst: "Tahun terparah", t_worst_d: "{n} titik setara MODIS",
    t_now: "Bulan ini vs biasanya", t_now_d: "{v} titik s.d. {d} · median bulan ini {m} (prorata {p})",
    t_last: "Bulan lalu ({b})", t_last_d: "{v} titik · median {m}",
    st_low: "▼ Di bawah normal", st_norm: "● Normal", st_high: "▲ Di atas normal", st_crit: "▲▲ Jauh di atas normal", st_na: "— Data kurang",
    tip_h: "Harmonis (setara MODIS)", tip_m: "MODIS mentah", tip_v: "VIIRS mentah", tip_k: "Faktor k", tip_src: "Sumber",
    tip_med: "Median bulan ini", tip_anom: "Anomali", src_m: "MODIS", src_mta: "MODIS Terra × k_TA", src_v: "VIIRS × k",
    partial: "bulan berjalan, s.d. {d}", no_data: "tidak ada pengamatan", era_v: "mulai VIIRS",
    leg_zero: "0", leg_hot: "titik api / bulan", leg_cells: "Total titik api (tahun terpilih)",
    nodata_area: "Tidak ada sel grid di area ini. Coba area yang lebih besar.",
    raw_need: "Isi MAP_KEY dan pilih wilayah dulu.", raw_long: "Rentang maksimum 60 hari.",
    raw_busy: "Mengambil {i}/{n}…", raw_ok: "Selesai: {n} titik di dalam wilayah.", raw_cors: "Peramban memblokir permintaan langsung (CORS). Buka tautan berikut satu per satu (masing-masing ≤5 hari, kotak pembatas wilayah):",
    show_rawv: "tampilkan VIIRS mentah (belum diharmonisasi)",
    med: "median", hl: "disorot", harm: "harmonis", raw_m: "MODIS mentah", raw_v: "VIIRS mentah",
  },
  en: {
    tagline: "One consistent hotspot record since 2000: MODIS + VIIRS harmonized",
    problem: "Fire managers need to know: <b>is fire activity in my area unusual this month, and when is the critical season?</b> The 20+ year satellite record is split between two sensors whose counts are not comparable — VIIRS (375 m) records far more hotspots than MODIS (1 km) for the same fire. This app converts both to one unit (<b>MODIS-equivalent</b>) and presents it as a calendar.",
    h_area: "1. Choose an area", tab_prov: "Province", tab_box: "Draw box", tab_pt: "Coordinates",
    lbl_prov: "Province / island", hint_prov: "Or click a province on the map.",
    btn_draw: "✏️ Start drawing a box", btn_draw_on: "Drag on the map… (click to cancel)",
    hint_box: "Click the button, then press-and-drag on the map to draw the area.",
    lbl_lat: "Latitude", lbl_lon: "Longitude", lbl_rad: "Radius (km)", btn_pt: "Apply",
    h_range: "2. Year range", lbl_from: "From", lbl_to: "To", area: "Area",
    h_cal: "Burning activity calendar", v_count: "Hotspot count", v_anom: "Anomaly vs median", show_num: "show numbers",
    cal_note: "Each cell = hotspots (MODIS-equivalent) in one month. Hover for the per-sensor breakdown.",
    cal_note_anom: "Color = difference from the median of the same month (all complete years). Red = more than usual, blue = fewer.",
    h_season: "Fire season: median by month", season_note: "Bar = median of selected years, line = 25–75% range, dot = highlighted year.",
    lbl_hl: "Highlight year", h_year: "Total per year", year_note: "Bars = harmonized result; grey line = raw MODIS. Tick the box to see how far raw VIIRS would drift without harmonization.",
    h_dl: "Download data", dl1_t: "Monthly table for this area (CSV)",
    dl1_d: "Per month: raw MODIS, raw VIIRS, k factor, harmonized value, median, anomaly.", dl1_b: "⬇ Download monthly CSV",
    dl2_t: "Raw hotspots from NASA FIRMS (CSV)",
    dl2_d: "Fetch the original hotspots for the chosen area & dates straight from the FIRMS API. Needs your free MAP_KEY (not stored).",
    dl2_b: "⬇ Fetch & download hotspots", lbl_src: "Sensor", h_method: "How is it harmonized?",
    foot: "Data: NASA FIRMS (MODIS C6.1, VIIRS 375 m S-NPP/NOAA-20/NOAA-21), province boundaries geoBoundaries (CC BY 4.0), basemap © OpenStreetMap. Built by Team Occupy Mars for the NASA Space Apps Challenge 2026. NASA does not endorse this project.",
    all_idn: "All of Indonesia", island: "Island", province: "Province", box: "Drawn box", circle: "Radius",
    cells: "grid cells", t_total: "Total hotspots", t_total_d: "MODIS-equivalent, {a}–{b}",
    t_peak: "Peak fire month", t_peak_d: "month with the highest median",
    t_worst: "Worst year", t_worst_d: "{n} MODIS-equivalent hotspots",
    t_now: "This month vs usual", t_now_d: "{v} hotspots to {d} · median for this month {m} (pro-rated {p})",
    t_last: "Last month ({b})", t_last_d: "{v} hotspots · median {m}",
    st_low: "▼ Below normal", st_norm: "● Normal", st_high: "▲ Above normal", st_crit: "▲▲ Far above normal", st_na: "— Not enough data",
    tip_h: "Harmonized (MODIS-eq.)", tip_m: "Raw MODIS", tip_v: "Raw VIIRS", tip_k: "k factor", tip_src: "Source",
    tip_med: "Median for this month", tip_anom: "Anomaly", src_m: "MODIS", src_mta: "MODIS Terra × k_TA", src_v: "VIIRS × k",
    partial: "month in progress, to {d}", no_data: "no observations", era_v: "VIIRS era",
    leg_zero: "0", leg_hot: "hotspots / month", leg_cells: "Total hotspots (selected years)",
    nodata_area: "No grid cells in this area. Try a larger area.",
    raw_need: "Enter a MAP_KEY and choose an area first.", raw_long: "Maximum range is 60 days.",
    raw_busy: "Fetching {i}/{n}…", raw_ok: "Done: {n} hotspots inside the area.", raw_cors: "The browser blocked the direct request (CORS). Open these links one by one (each ≤5 days, area bounding box):",
    show_rawv: "show raw VIIRS (not harmonized)",
    med: "median", hl: "highlighted", harm: "harmonized", raw_m: "raw MODIS", raw_v: "raw VIIRS",
  },
};
const BULAN = { id: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
                en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] };
const BULAN_PANJANG = { id: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
                        en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] };

// skala warna: berurutan (oranye→merah tua) dan divergen (biru–abu–merah)
const SEQ = ["#fde9d9", "#fbcfae", "#f7ad7f", "#f08853", "#e1622f", "#c4441d", "#9c3115", "#6e220f"];
const DIV = ["#184f95", "#3987e5", "#9ec5f4", "#ecebe6", "#f5b9a3", "#e2674a", "#b42d24"];
const DIV_BRK = [-0.75, -0.5, -0.2, 0.2, 1, 3]; // (H/median - 1)

const S = { lang: (navigator.language || "en").toLowerCase().startsWith("id") ? "id" : "en", view: "jumlah", showNum: false, sel: null, areaName: "", areaKind: "", aoi: null, bbox: null, hl: null };
let META, GRID, CELLS, PROV, map, cellLayer, provLayer, aoiLayer;
let CELLINFO; // per sel: {prov, pulau, lat, lon, data:[m,M,V,...]}
let NM, YM0, MV0, M_LAST, PART;

const t = (k, v = {}) => (T[S.lang][k] ?? k).replace(/\{(\w+)\}/g, (_, x) => v[x] ?? "");
const $ = (s) => document.querySelector(s);
const fmt = (x) => (x == null || !isFinite(x) ? "—" : Math.round(x).toLocaleString(S.lang === "id" ? "id-ID" : "en-US"));
const ym = (i) => { const z = YM0.m - 1 + i; return { y: YM0.y + Math.floor(z / 12), m: (z % 12) + 1 }; };
const idx = (y, m) => (y - YM0.y) * 12 + (m - YM0.m);
const median = (a) => { const b = a.filter((x) => x != null).sort((p, q) => p - q); if (!b.length) return null; const h = b.length / 2; return b.length % 2 ? b[h | 0] : (b[h - 1] + b[h]) / 2; };
const quant = (a, q) => { const b = a.filter((x) => x != null).sort((p, q2) => p - q2); if (!b.length) return null; const p = (b.length - 1) * q, lo = Math.floor(p), hi = Math.ceil(p); return b[lo] + (b[hi] - b[lo]) * (p - lo); };

// ---------------------------------------------------------------- muat data
Promise.all(["meta", "grid", "cells"].map((f) => fetch(`data/${f}.json`).then((r) => r.json())).concat(fetch("data/provinsi.geojson").then((r) => r.json())))
  .then(([meta, grid, cells, prov]) => { META = meta; GRID = grid; CELLS = cells; PROV = prov; init(); })
  .catch((e) => { document.querySelector(".content").innerHTML = `<p class="bad">Gagal memuat data: ${e}</p>`; });

function init() {
  const [y0, m0] = GRID.bulan0.split("-").map(Number);
  YM0 = { y: y0, m: m0 };
  NM = GRID.n_bulan;
  M_LAST = NM - 1;
  const [vy, vm] = META.bulan_mulai_viirs.split("-").map(Number);
  MV0 = idx(vy, vm);
  const td = new Date(META.tanggal_data + "T00:00:00");
  const lst = ym(M_LAST);
  PART = (td.getFullYear() === lst.y && td.getMonth() + 1 === lst.m) ? { day: td.getDate(), dim: new Date(lst.y, lst.m, 0).getDate(), date: META.tanggal_data } : null;

  CELLINFO = {};
  for (const [id, pi] of Object.entries(CELLS.sel)) {
    const n = +id, r = Math.floor(n / CELLS.ncol), c = n % CELLS.ncol;
    CELLINFO[id] = { prov: pi, pulau: CELLS.pulau[CELLS.pulau_provinsi[pi]], lat: CELLS.lat0 + (r + 0.5) * CELLS.res, lon: CELLS.lon0 + (c + 0.5) * CELLS.res, data: GRID.sel[id] || [] };
  }
  // pilihan tahun
  const yFirst = ym(0).y, yLast = ym(M_LAST).y;
  for (const s of ["#y0", "#y1", "#sel-hl"]) $(s).innerHTML = "";
  for (let y = yFirst; y <= yLast; y++) {
    $("#y0").add(new Option(y, y)); $("#y1").add(new Option(y, y)); $("#sel-hl").add(new Option(y, y));
  }
  $("#y0").value = yFirst + 1 <= yLast ? yFirst + 1 : yFirst; // 2000 hanya Nov–Des
  $("#y1").value = yLast; $("#sel-hl").value = yLast; S.hl = yLast;
  // tanggal unduhan mentah default: 7 hari terakhir
  const d1 = new Date(td); const d0 = new Date(td); d0.setDate(d0.getDate() - 6);
  $("#in-d0").value = d0.toISOString().slice(0, 10); $("#in-d1").value = d1.toISOString().slice(0, 10);

  fillProvSelect();
  initMap();
  bindUI();
  applyLang();
  selectPreset("ALL");
}

// ---------------------------------------------------------------- pilihan wilayah
function fillProvSelect() {
  const s = $("#sel-prov"); const cur = s.value; s.innerHTML = "";
  s.add(new Option(t("all_idn"), "ALL"));
  const og1 = document.createElement("optgroup"); og1.label = t("island");
  CELLS.pulau.forEach((p, i) => og1.appendChild(new Option(p, "P" + i))); s.appendChild(og1);
  const og2 = document.createElement("optgroup"); og2.label = t("province");
  CELLS.provinsi.map((n, i) => [n, i]).sort((a, b) => a[0].localeCompare(b[0])).forEach(([n, i]) => og2.appendChild(new Option(n, "V" + i)));
  s.appendChild(og2);
  if (cur) s.value = cur;
}

function selectPreset(v) {
  const ids = Object.keys(CELLINFO);
  let sel;
  if (v === "ALL") { sel = ids; S.areaName = t("all_idn"); }
  else if (v[0] === "P") { const p = CELLS.pulau[+v.slice(1)]; sel = ids.filter((i) => CELLINFO[i].pulau === p); S.areaName = `${t("island")} ${p}`; }
  else { const pi = +v.slice(1); sel = ids.filter((i) => CELLINFO[i].prov === pi); S.areaName = CELLS.provinsi[pi]; }
  S.preset = v; S.areaKind = "preset";
  setSelection(sel, null);
  if (S.bbox && map) map.fitBounds([[S.bbox[1], S.bbox[0]], [S.bbox[3], S.bbox[2]]], { padding: [10, 10] });
  highlightProv(v);
}

function setSelection(ids, shape) {
  S.sel = ids;
  if (aoiLayer) { map.removeLayer(aoiLayer); aoiLayer = null; }
  if (shape) { aoiLayer = shape.addTo(map); }
  // kotak pembatas untuk unduhan mentah
  let w = 180, s = 90, e = -180, n = -90;
  for (const id of ids) { const c = CELLINFO[id]; w = Math.min(w, c.lon - CELLS.res / 2); e = Math.max(e, c.lon + CELLS.res / 2); s = Math.min(s, c.lat - CELLS.res / 2); n = Math.max(n, c.lat + CELLS.res / 2); }
  S.bbox = ids.length ? [w, s, e, n].map((x) => +x.toFixed(3)) : null;
  render();
}

function cellsInBox(b) { return Object.keys(CELLINFO).filter((i) => { const c = CELLINFO[i]; return c.lat >= b.getSouth() && c.lat <= b.getNorth() && c.lon >= b.getWest() && c.lon <= b.getEast(); }); }
function cellsInCircle(lat, lon, km) {
  const R = 6371;
  return Object.keys(CELLINFO).filter((i) => {
    const c = CELLINFO[i]; const dl = (c.lat - lat) * Math.PI / 180, dn = (c.lon - lon) * Math.PI / 180;
    const a = Math.sin(dl / 2) ** 2 + Math.cos(lat * Math.PI / 180) * Math.cos(c.lat * Math.PI / 180) * Math.sin(dn / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a)) <= km;
  });
}

// ---------------------------------------------------------------- peta
function initMap() {
  map = L.map("map", { zoomSnap: 0.5, preferCanvas: true }).fitBounds([[-11, 95], [6, 141]]);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom: 12,
  }).addTo(map);
  cellLayer = L.layerGroup().addTo(map);
  provLayer = L.geoJSON(PROV, {
    style: () => ({ color: "#6b6a66", weight: 0.7, fill: true, fillOpacity: 0 }),
    onEachFeature: (f, l) => {
      const pi = CELLS.provinsi_en.indexOf(f.properties.shapeName);
      l.on("click", () => { if (S.drawing) return; setMode("prov"); $("#sel-prov").value = "V" + pi; selectPreset("V" + pi); });
      l.bindTooltip(() => CELLS.provinsi[pi], { sticky: true });
    },
  }).addTo(map);
  // menggambar kotak (tanpa plugin)
  let start = null, rect = null;
  map.on("mousedown", (e) => { if (!S.drawing) return; start = e.latlng; rect = L.rectangle([start, start], { color: "#151514", weight: 2, fill: false, dashArray: "4 3" }).addTo(map); });
  map.on("mousemove", (e) => { if (start && rect) rect.setBounds([start, e.latlng]); });
  map.on("mouseup", (e) => {
    if (!start) return; const b = L.latLngBounds(start, e.latlng); map.removeLayer(rect); start = null; rect = null; stopDraw();
    const ids = cellsInBox(b);
    S.areaName = `${t("box")} ${b.getSouth().toFixed(2)}…${b.getNorth().toFixed(2)}°, ${b.getWest().toFixed(2)}…${b.getEast().toFixed(2)}°`;
    S.areaKind = "box"; highlightProv(null);
    setSelection(ids, L.rectangle(b, { color: "#151514", weight: 2, fill: false }));
  });
}

function highlightProv(v) {
  provLayer.eachLayer((l) => {
    const pi = CELLS.provinsi_en.indexOf(l.feature.properties.shapeName);
    const on = v && (v === "V" + pi || (v[0] === "P" && CELLS.pulau_provinsi[pi] === +v.slice(1)));
    l.setStyle(on ? { color: "#151514", weight: 2 } : { color: "#6b6a66", weight: 0.7 });
  });
}

function drawCells(totals, max) {
  cellLayer.clearLayers();
  const r = CELLS.res / 2;
  for (const [id, v] of Object.entries(totals)) {
    if (v <= 0) continue; const c = CELLINFO[id];
    L.rectangle([[c.lat - r, c.lon - r], [c.lat + r, c.lon + r]], { stroke: false, fillColor: seqColor(v / Math.max(1, (YEARS().length)), max), fillOpacity: 0.85, interactive: false }).addTo(cellLayer);
  }
  provLayer.bringToFront();
}

function startDraw() { S.drawing = true; map.dragging.disable(); $("#map").classList.add("drawing"); $("#btn-draw").classList.add("active"); $("#btn-draw").textContent = t("btn_draw_on"); }
function stopDraw() { S.drawing = false; map.dragging.enable(); $("#map").classList.remove("drawing"); $("#btn-draw").classList.remove("active"); $("#btn-draw").textContent = t("btn_draw"); }

// ---------------------------------------------------------------- hitung
function kFor(pulau, m) { return META.k[pulau][m - 1]; }

function aggregate(ids) {
  const M = new Float64Array(NM), V = new Float64Array(NM), H = new Float64Array(NM);
  for (const id of ids) {
    const c = CELLINFO[id], d = c.data;
    for (let j = 0; j < d.length; j += 3) {
      const i = d[j], mm = d[j + 1], vv = d[j + 2];
      M[i] += mm; V[i] += vv;
      H[i] += i >= MV0 ? vv * kFor(c.pulau, ym(i).m) : mm;
    }
  }
  return { M, V, H };
}

function YEARS() { const a = +$("#y0").value, b = +$("#y1").value; const out = []; for (let y = Math.min(a, b); y <= Math.max(a, b); y++) out.push(y); return out; }

function complete(i) { return i >= 0 && i < NM && !(PART && i === M_LAST); }

function monthlyMedian(H, mon, years) {
  const vals = years.map((y) => idx(y, mon)).filter((i) => complete(i)).map((i) => H[i]);
  return median(vals);
}

function seqBreaks(max) {
  // kelas logaritmik 1 … max (dibulatkan)
  const n = SEQ.length, out = [];
  const top = Math.max(max, 2);
  for (let k = 1; k < n; k++) out.push(Math.max(1, Math.round(Math.exp(Math.log(top) * k / n))));
  return [...new Set(out)];
}
let BRK = [1];
function seqColor(v) { if (!(v > 0)) return "var(--zero)"; let k = 0; while (k < BRK.length && v >= BRK[k]) k++; return SEQ[Math.min(k, SEQ.length - 1)]; }
function divColor(r) { let k = 0; while (k < DIV_BRK.length && r >= DIV_BRK[k]) k++; return DIV[k]; }
function isDark(col) { return [SEQ[5], SEQ[6], SEQ[7], DIV[0], DIV[1], DIV[6]].includes(col); }

// ---------------------------------------------------------------- tampilan
function render() {
  const years = YEARS();
  $("#area-name").textContent = S.areaName;
  $("#area-cells").textContent = S.sel.length ? `(${S.sel.length} ${t("cells")} · 0,25°)` : "";
  if (!S.sel.length) { $("#tiles").innerHTML = `<p class="bad">${t("nodata_area")}</p>`; $("#cal").innerHTML = ""; return; }
  const A = aggregate(S.sel);
  S.A = A;
  const allYears = []; for (let y = ym(0).y; y <= ym(M_LAST).y; y++) allYears.push(y);
  const fullYears = allYears.filter((y) => idx(y, 1) >= 0 && complete(idx(y, 12)));
  S.medAll = Array.from({ length: 12 }, (_, k) => monthlyMedian(A.H, k + 1, fullYears));

  // skala berdasarkan bulan dalam rentang
  let mx = 0; for (const y of years) for (let m = 1; m <= 12; m++) { const i = idx(y, m); if (i >= 0 && i < NM) mx = Math.max(mx, A.H[i]); }
  BRK = seqBreaks(mx);

  renderTiles(A, years);
  renderCalendar(A, years);
  renderSeason(A, years);
  renderYears(A, years);
  renderMethod();
  // peta: total per sel pada rentang tahun (rata-rata per tahun → skala bulanan sama dengan legenda? pakai skala sendiri)
  const i0 = Math.max(0, idx(years[0], 1)), i1 = Math.min(M_LAST, idx(years[years.length - 1], 12));
  const tot = {}; let tmax = 0;
  for (const [id, c] of Object.entries(CELLINFO)) {
    let s = 0; const d = c.data;
    for (let j = 0; j < d.length; j += 3) { const i = d[j]; if (i < i0 || i > i1) continue; s += i >= MV0 ? d[j + 2] * kFor(c.pulau, ym(i).m) : d[j + 1]; }
    if (s > 0) { tot[id] = s; tmax = Math.max(tmax, s); }
  }
  const saveBRK = BRK; BRK = seqBreaks(tmax);
  cellLayer.clearLayers(); const r = CELLS.res / 2;
  for (const [id, v] of Object.entries(tot)) { const c = CELLINFO[id]; L.rectangle([[c.lat - r, c.lon - r], [c.lat + r, c.lon + r]], { stroke: false, fillColor: seqColor(v), fillOpacity: 0.8, interactive: false }).addTo(cellLayer); }
  provLayer.bringToFront(); if (aoiLayer) aoiLayer.bringToFront();
  $("#map-legend").innerHTML = `<span>${t("leg_cells")}:</span>` + legendHTML(BRK);
  BRK = saveBRK;
}

function legendHTML(brk) {
  let h = `<span class="sw" style="background:var(--zero)"></span>0`;
  const edges = [1, ...brk];
  SEQ.slice(0, edges.length).forEach((c, k) => { h += ` <span class="sw" style="background:${c}"></span>${fmt(edges[k])}${k === edges.length - 1 ? "+" : ""}`; });
  return h;
}

function statusOf(ratio) {
  if (ratio == null || !isFinite(ratio)) return ["st-norm", t("st_na")];
  if (ratio < 0.75) return ["st-low", t("st_low")];
  if (ratio <= 1.5) return ["st-norm", t("st_norm")];
  if (ratio <= 3) return ["st-high", t("st_high")];
  return ["st-crit", t("st_crit")];
}

function renderTiles(A, years) {
  const i0 = Math.max(0, idx(years[0], 1)), i1 = Math.min(M_LAST, idx(years[years.length - 1], 12));
  let tot = 0; for (let i = i0; i <= i1; i++) tot += A.H[i];
  const med = Array.from({ length: 12 }, (_, k) => monthlyMedian(A.H, k + 1, years));
  let pk = 0; med.forEach((v, k) => { if ((v ?? -1) > (med[pk] ?? -1)) pk = k; });
  const annual = years.map((y) => { let s = 0; for (let m = 1; m <= 12; m++) { const i = idx(y, m); if (i >= 0 && i < NM) s += A.H[i]; } return [y, s]; });
  const worst = annual.reduce((a, b) => (b[1] > a[1] ? b : a), [null, -1]);
  const L1 = ym(M_LAST);
  const medNow = S.medAll[L1.m - 1];
  let tiles = `
    <div class="tile"><div class="k">${t("t_total")}</div><div class="v">${fmt(tot)}</div><div class="d">${t("t_total_d", { a: years[0], b: years[years.length - 1] })}</div></div>
    <div class="tile"><div class="k">${t("t_peak")}</div><div class="v">${BULAN_PANJANG[S.lang][pk]}</div><div class="d">${t("t_peak_d")} (${fmt(med[pk])})</div></div>
    <div class="tile"><div class="k">${t("t_worst")}</div><div class="v">${worst[0] ?? "—"}</div><div class="d">${t("t_worst_d", { n: fmt(worst[1]) })}</div></div>`;
  if (PART) {
    const pro = medNow == null ? null : medNow * PART.day / PART.dim;
    const ratio = pro > 0 ? A.H[M_LAST] / pro : (A.H[M_LAST] > 0 ? Infinity : null);
    const [cls, lab] = statusOf(pro === 0 && A.H[M_LAST] === 0 ? 1 : ratio);
    tiles += `<div class="tile"><div class="k">${t("t_now")} · ${BULAN_PANJANG[S.lang][L1.m - 1]} ${L1.y}</div><div class="v">${fmt(A.H[M_LAST])}</div>
      <span class="status ${cls}">${lab}</span><div class="d">${t("t_now_d", { v: fmt(A.H[M_LAST]), d: PART.date, m: fmt(medNow), p: fmt(pro) })}</div></div>`;
  } else {
    const ratio = medNow > 0 ? A.H[M_LAST] / medNow : null;
    const [cls, lab] = statusOf(ratio);
    tiles += `<div class="tile"><div class="k">${t("t_last", { b: BULAN_PANJANG[S.lang][L1.m - 1] + " " + L1.y })}</div><div class="v">${fmt(A.H[M_LAST])}</div>
      <span class="status ${cls}">${lab}</span><div class="d">${t("t_last_d", { v: fmt(A.H[M_LAST]), m: fmt(medNow) })}</div></div>`;
  }
  $("#tiles").innerHTML = tiles;
}

function renderCalendar(A, years) {
  const tb = $("#cal");
  let h = `<thead><tr><th></th>${BULAN[S.lang].map((b) => `<th>${b}</th>`).join("")}<th>Σ</th></tr></thead><tbody>`;
  const vy = ym(MV0).y;
  for (const y of years) {
    let rowSum = 0;
    const sep = y === vy && years[0] < vy ? " class=\"sep\"" : "";
    h += `<tr${sep}><th class="y">${y}${y === vy && years[0] < vy ? ` <small>${t("era_v")}</small>` : ""}</th>`;
    for (let m = 1; m <= 12; m++) {
      const i = idx(y, m);
      if (i < 0 || i >= NM) { h += `<td class="na" data-i="${i}" aria-label="${t("no_data")}"></td>`; continue; }
      const v = A.H[i]; rowSum += v;
      let col, txt = "";
      if (S.view === "jumlah") { col = seqColor(v); txt = v > 0 ? fmt(v) : ""; }
      else {
        const md = S.medAll[m - 1];
        let r = md > 0 ? v / md - 1 : (v > 0 ? 9 : 0);
        if (PART && i === M_LAST && md > 0) r = v / (md * PART.day / PART.dim) - 1;
        col = divColor(r); txt = md > 0 || v > 0 ? (r > 0 ? "+" : "") + Math.round(r * 100) + "%" : "";
      }
      const cls = [isDark(col) ? "dark" : "", PART && i === M_LAST ? "part" : ""].join(" ").trim();
      h += `<td data-i="${i}" class="${cls}" style="background:${col}">${S.showNum ? txt : ""}</td>`;
    }
    h += `<th class="y">${fmt(rowSum)}</th></tr>`;
  }
  tb.innerHTML = h + "</tbody>";
  // legenda
  if (S.view === "jumlah") $("#cal-legend").innerHTML = legendHTML(BRK) + ` <span>${t("leg_hot")}</span>`;
  else {
    const lab = ["≤ −75%", "−75…−50%", "−50…−20%", "±20%", "+20…+100%", "+100…+300%", "> +300%"];
    $("#cal-legend").innerHTML = DIV.map((c, k) => `<span class="sw" style="background:${c}"></span>${lab[k]}`).join(" ");
  }
  $("[data-i=cal_note]").textContent = S.view === "jumlah" ? t("cal_note") : t("cal_note_anom");
}

function tipFor(i) {
  const A = S.A; const { y, m } = ym(i);
  if (i < 0 || i >= NM) return `<b>${BULAN_PANJANG[S.lang][m - 1]} ${y}</b><br>${t("no_data")}`;
  const md = S.medAll[m - 1];
  const kk = S.sel.length ? (A.V[i] > 0 && i >= MV0 ? A.H[i] / A.V[i] : null) : null;
  const src = i >= MV0 ? t("src_v") + (META.sumber_viirs_pengganti[`${y}-${String(m).padStart(2, "0")}`] ? ` (${META.sumber_viirs_pengganti[`${y}-${String(m).padStart(2, "0")}`]}→S-NPP)` : " (S-NPP)")
    : (i < idx(...META.bulan_aqua.split("-").map(Number)) ? t("src_mta") : t("src_m"));
  const anom = md > 0 ? Math.round((A.H[i] / (PART && i === M_LAST ? md * PART.day / PART.dim : md) - 1) * 100) : null;
  return `<b>${BULAN_PANJANG[S.lang][m - 1]} ${y}</b>${PART && i === M_LAST ? ` · ${t("partial", { d: PART.date })}` : ""}
    <table><tr><td>${t("tip_h")}</td><td><b>${fmt(A.H[i])}</b></td></tr>
    <tr><td>${t("tip_m")}</td><td>${fmt(A.M[i])}</td></tr>
    <tr><td>${t("tip_v")}</td><td>${i >= MV0 || A.V[i] > 0 ? fmt(A.V[i]) : "—"}</td></tr>
    <tr><td>${t("tip_k")}</td><td>${kk ? kk.toFixed(3) : "—"}</td></tr>
    <tr><td>${t("tip_med")}</td><td>${fmt(md)}</td></tr>
    <tr><td>${t("tip_anom")}</td><td>${anom == null ? "—" : (anom > 0 ? "+" : "") + anom + "%"}</td></tr>
    <tr><td>${t("tip_src")}</td><td>${src}</td></tr></table>`;
}

// --- grafik SVG sederhana (satu sumbu)
function niceMax(v) { if (v <= 0) return 1; const p = 10 ** Math.floor(Math.log10(v)); for (const k of [1, 2, 2.5, 5, 10]) if (k * p >= v) return k * p; return 10 * p; }
function axisY(W, H, pad, ymax, n = 4) {
  let s = ""; for (let k = 0; k <= n; k++) { const v = ymax * k / n, y = H - pad.b - (H - pad.t - pad.b) * k / n;
    s += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y}" y2="${y}" stroke="#e3e1db" stroke-width="1"/><text x="${pad.l - 6}" y="${y + 4}" text-anchor="end">${fmt(v)}</text>`; }
  return s;
}

function renderSeason(A, years) {
  const W = 560, H = 250, pad = { l: 52, r: 10, t: 12, b: 26 };
  const hl = +$("#sel-hl").value;
  const stats = Array.from({ length: 12 }, (_, k) => {
    const vals = years.map((y) => idx(y, k + 1)).filter(complete).map((i) => A.H[i]);
    const i = idx(hl, k + 1);
    return { med: median(vals), q1: quant(vals, 0.25), q3: quant(vals, 0.75), hl: i >= 0 && i < NM ? A.H[i] : null, part: PART && i === M_LAST };
  });
  const ymax = niceMax(Math.max(1, ...stats.map((s) => Math.max(s.q3 ?? 0, s.hl ?? 0, s.med ?? 0))));
  const sx = (W - pad.l - pad.r) / 12, sy = (v) => H - pad.b - (H - pad.t - pad.b) * v / ymax;
  let g = axisY(W, H, pad, ymax);
  stats.forEach((s, k) => {
    const x = pad.l + sx * k + sx * 0.2, w = sx * 0.6;
    if (s.med != null) g += `<rect x="${x}" y="${sy(s.med)}" width="${w}" height="${Math.max(0, H - pad.b - sy(s.med))}" rx="3" fill="#f08853"><title>${BULAN_PANJANG[S.lang][k]}: ${t("med")} ${fmt(s.med)}</title></rect>`;
    if (s.q1 != null) g += `<line x1="${x + w / 2}" x2="${x + w / 2}" y1="${sy(s.q1)}" y2="${sy(s.q3)}" stroke="#151514" stroke-width="2"/>`;
    if (s.hl != null) g += `<circle cx="${x + w / 2}" cy="${sy(s.hl)}" r="5" fill="${s.part ? "#fff" : "#151514"}" stroke="#151514" stroke-width="2"><title>${hl} ${BULAN_PANJANG[S.lang][k]}: ${fmt(s.hl)}${s.part ? " (" + t("partial", { d: PART.date }) + ")" : ""}</title></circle>`;
    g += `<text x="${x + w / 2}" y="${H - 8}" text-anchor="middle">${BULAN[S.lang][k]}</text>`;
  });
  g += `<g transform="translate(${pad.l + 6},${pad.t + 4})"><rect width="12" height="10" rx="2" fill="#f08853"/><text x="16" y="9">${t("med")} ${years[0]}–${years[years.length - 1]}</text>
    <circle cx="150" cy="5" r="5" fill="#151514"/><text x="160" y="9">${hl}</text></g>`;
  $("#ch-season").innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t("h_season")}">${g}</svg>`;
}

function renderYears(A, years) {
  const W = 560, H = 250, pad = { l: 52, r: 10, t: 12, b: 26 };
  const rows = years.map((y) => { let h = 0, m = 0, v = 0; for (let k = 1; k <= 12; k++) { const i = idx(y, k); if (i >= 0 && i < NM) { h += A.H[i]; m += A.M[i]; v += A.V[i]; } } return { y, h, m, v }; });
  const ymax = niceMax(Math.max(1, ...rows.map((r) => Math.max(r.h, r.m, S.showRawV ? r.v : 0))));
  const sx = (W - pad.l - pad.r) / rows.length, sy = (v) => H - pad.b - (H - pad.t - pad.b) * v / ymax;
  let g = axisY(W, H, pad, ymax);
  rows.forEach((r, k) => {
    const x = pad.l + sx * k + sx * 0.15, w = Math.max(2, sx * 0.7);
    g += `<rect x="${x}" y="${sy(r.h)}" width="${w}" height="${Math.max(0, H - pad.b - sy(r.h))}" rx="2" fill="${r.y >= ym(MV0).y ? "#c4441d" : "#e1622f"}"><title>${r.y}: ${t("harm")} ${fmt(r.h)} · ${t("raw_m")} ${fmt(r.m)} · ${t("raw_v")} ${fmt(r.v)}</title></rect>`;
    const step = Math.ceil(rows.length / 13);
    if (k % step === 0) g += `<text x="${x + w / 2}" y="${H - 8}" text-anchor="middle">${String(r.y).slice(2)}</text>`;
  });
  const line = (key, dash) => { const pts = rows.map((r, k) => (r[key] > 0 ? `${pad.l + sx * k + sx / 2},${sy(r[key])}` : null)).filter(Boolean); return pts.length > 1 ? `<polyline points="${pts.join(" ")}" fill="none" stroke="#7a7873" stroke-width="2" ${dash ? 'stroke-dasharray="5 4"' : ""}/>` : ""; };
  g += line("m", false) + (S.showRawV ? line("v", true) : "");
  g += `<g transform="translate(${pad.l + 6},${pad.t + 4})"><rect width="12" height="10" rx="2" fill="#c4441d"/><text x="16" y="9">${t("harm")}</text>
    <line x1="90" x2="110" y1="5" y2="5" stroke="#7a7873" stroke-width="2"/><text x="114" y="9">${t("raw_m")}</text>
    ${S.showRawV ? `<line x1="210" x2="230" y1="5" y2="5" stroke="#7a7873" stroke-width="2" stroke-dasharray="5 4"/><text x="234" y="9">${t("raw_v")}</text>` : ""}</g>`;
  $("#ch-year").innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t("h_year")}">${g}</svg>`;
}

function renderMethod() {
  const v = META.validasi || {}; const id = S.lang === "id";
  const vr = (o) => (o ? `<td>${o.harmonis.r2 ?? "—"}</td><td>${o.harmonis.bias_pct}%</td><td>${o.harmonis.mape_pct}%</td><td>${o.viirs_mentah.bias_pct}%</td><td>${o.n_bulan}</td>` : "<td colspan=5>—</td>");
  const lbl = (k) => id ? k : k.replace("pulau×bulan", "island×month").replace("nasional×bulan", "national×month");
  const vrows = Object.entries(v).map(([k, o]) => `<tr><td>${lbl(k)}</td>${vr(o)}</tr>`).join("");
  const krows = Object.entries(META.k).map(([p, arr]) => `<tr><td>${p}</td>${arr.map((x) => `<td>${x == null ? "—" : x.toFixed(2)}</td>`).join("")}</tr>`).join("");
  $("#method").innerHTML = id ? `
    <ol>
      <li><b>Data:</b> titik api NASA FIRMS Indonesia — MODIS C6.1 (Terra & Aqua, 1 km, sejak ${META.bulan_awal}) dan VIIRS 375 m (S-NPP sejak 2012; NOAA-20 & NOAA-21). Saringan: MODIS confidence ≥ 30, VIIRS nominal/high, hanya tipe vegetasi (type 0).</li>
      <li><b>Agregasi:</b> titik dihitung per sel grid 0,25° (±28 km) per bulan dan dipetakan ke 34 provinsi / 7 pulau.</li>
      <li><b>Satuan target "setara MODIS":</b> sebelum ${META.bulan_mulai_viirs} memakai MODIS. Bulan sebelum Aqua aktif (${META.bulan_aqua}) dikali k<sub>TA</sub> = ${META.k_TA}.</li>
      <li><b>Sejak VIIRS:</b> nilai = VIIRS × k[pulau, bulan], dengan k = ΣMODIS ÷ ΣVIIRS selama tahun tumpang tindih ${META.overlap[0]}–${META.overlap[1]} (sebelum orbit Terra/Aqua bergeser). Bila S-NPP tidak tersedia (berhenti 2 Nov 2026), NOAA-20 dikonversi ke S-NPP dengan k<sub>N20</sub> = ${META.k_N20 ?? "—"}.</li>
      <li><b>Uji:</b> leave-one-year-out — k dihitung tanpa satu tahun, lalu dipakai menebak MODIS tahun itu.</li>
    </ol>` : `
    <ol>
      <li><b>Data:</b> NASA FIRMS hotspots for Indonesia — MODIS C6.1 (Terra & Aqua, 1 km, since ${META.bulan_awal}) and VIIRS 375 m (S-NPP since 2012; NOAA-20 & NOAA-21). Filters: MODIS confidence ≥ 30, VIIRS nominal/high, vegetation fires only (type 0).</li>
      <li><b>Aggregation:</b> hotspots counted per 0.25° grid cell (~28 km) per month and mapped to 34 provinces / 7 islands.</li>
      <li><b>Target unit "MODIS-equivalent":</b> before ${META.bulan_mulai_viirs} MODIS is used. Months before Aqua (${META.bulan_aqua}) are multiplied by k<sub>TA</sub> = ${META.k_TA}.</li>
      <li><b>VIIRS era:</b> value = VIIRS × k[island, month], with k = ΣMODIS ÷ ΣVIIRS over the overlap years ${META.overlap[0]}–${META.overlap[1]} (before the Terra/Aqua orbit drift). When S-NPP is unavailable (ended 2 Nov 2026), NOAA-20 is converted to S-NPP with k<sub>N20</sub> = ${META.k_N20 ?? "—"}.</li>
      <li><b>Test:</b> leave-one-year-out — k is computed without one year and used to predict that year's MODIS count.</li>
    </ol>`;
  $("#method").innerHTML += `
    <h3>${id ? "Faktor k per pulau × bulan" : "k factor per island × month"}</h3>
    <div class="cal-wrap"><table class="kt"><tr><th></th>${BULAN[S.lang].map((b) => `<th>${b}</th>`).join("")}</tr>${krows}</table></div>
    <h3>${id ? "Hasil uji (leave-one-year-out)" : "Validation (leave-one-year-out)"}</h3>
    <div class="cal-wrap"><table><tr><th></th><th>R² ${id ? "harmonis" : "harmonized"}</th><th>Bias</th><th>${id ? "Galat median" : "Median error"}</th><th>Bias VIIRS ${id ? "mentah" : "raw"}</th><th>n</th></tr>${vrows}</table></div>
    <p class="note">${id ? "Data diolah" : "Data processed"}: ${META.dibuat} · ${id ? "data s.d." : "data to"} ${META.tanggal_data}</p>`;
}

// ---------------------------------------------------------------- unduhan
function download(name, text) {
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function slug(s) { return s.normalize("NFKD").replace(/[^\w]+/g, "_").replace(/^_|_$/g, "").toLowerCase().slice(0, 40); }

function csvMonthly() {
  const A = S.A, years = YEARS();
  const rows = [["tahun", "bulan", "modis_mentah", "viirs_mentah_setara_snpp", "k_efektif", "harmonis_setara_modis", "sumber", "median_bulan", "anomali_pct", "catatan"]];
  for (const y of years) for (let m = 1; m <= 12; m++) {
    const i = idx(y, m); if (i < 0 || i >= NM) continue;
    const md = S.medAll[m - 1];
    const kk = i >= MV0 && A.V[i] > 0 ? (A.H[i] / A.V[i]).toFixed(4) : "";
    const src = i >= MV0 ? "VIIRS*k" : "MODIS";
    const den = PART && i === M_LAST && md != null ? md * PART.day / PART.dim : md;
    const an = den > 0 ? ((A.H[i] / den - 1) * 100).toFixed(1) : "";
    rows.push([y, m, A.M[i].toFixed(1), A.V[i].toFixed(1), kk, A.H[i].toFixed(1), src, md == null ? "" : md.toFixed(1), an, PART && i === M_LAST ? `parsial s.d. ${PART.date}` : ""]);
  }
  const head = `# ApiKala — ${S.areaName} — sel grid: ${S.sel.length} — bbox ${S.bbox?.join(",")}\n# Sumber: NASA FIRMS (MODIS C6.1, VIIRS 375 m). Harmonis = setara MODIS Terra+Aqua.\n`;
  download(`apikala_${slug(S.areaName)}_${years[0]}-${years[years.length - 1]}.csv`, head + rows.map((r) => r.join(",")).join("\n"));
}

async function rawHotspots() {
  const key = $("#in-key").value.trim(), st = $("#raw-status");
  if (!key || !S.bbox) { st.textContent = t("raw_need"); return; }
  const d0 = new Date($("#in-d0").value), d1 = new Date($("#in-d1").value);
  const days = Math.round((d1 - d0) / 864e5) + 1;
  if (!(days > 0) || days > 60) { st.textContent = t("raw_long"); return; }
  const src = $("#in-src").value, area = S.bbox.join(",");
  const urls = [];
  for (let d = new Date(d0); d <= d1; d.setDate(d.getDate() + 5)) {
    const n = Math.min(5, Math.round((d1 - d) / 864e5) + 1);
    urls.push(`https://firms.modaps.eosdis.nasa.gov/api/area/csv/${key}/${src}/${area}/${n}/${d.toISOString().slice(0, 10)}`);
  }
  const set = new Set(S.sel); let header = null; const out = [];
  try {
    for (let k = 0; k < urls.length; k++) {
      st.textContent = t("raw_busy", { i: k + 1, n: urls.length });
      const txt = await (await fetch(urls[k])).text();
      const lines = txt.trim().split(/\r?\n/);
      if (!lines[0].toLowerCase().startsWith("latitude")) throw new Error(lines[0].slice(0, 120));
      header = lines[0]; const cols = header.split(",");
      const iLat = cols.indexOf("latitude"), iLon = cols.indexOf("longitude");
      for (const ln of lines.slice(1)) {
        const p = ln.split(","); const lat = +p[iLat], lon = +p[iLon];
        const id = Math.floor((lat - CELLS.lat0) / CELLS.res) * CELLS.ncol + Math.floor((lon - CELLS.lon0) / CELLS.res);
        if (set.has(String(id))) out.push(ln);
      }
    }
    download(`titik_api_${src}_${slug(S.areaName)}_${$("#in-d0").value}_${$("#in-d1").value}.csv`, header + "\n" + out.join("\n"));
    st.textContent = t("raw_ok", { n: out.length.toLocaleString() });
  } catch (e) {
    const safe = urls.map((u) => u.replace(key, "MAP_KEY"));
    st.innerHTML = `${e.message && !/fetch/i.test(e.message) ? `<span class="bad">${e.message}</span><br>` : ""}${t("raw_cors")}<br>` +
      urls.map((u, k) => `<a href="${u}" target="_blank" rel="noopener">${safe[k].split("/").slice(-2).join(" · ")}</a>`).join("<br>");
  }
}

// ---------------------------------------------------------------- UI
function setMode(mode) {
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("on", b.dataset.mode === mode));
  for (const m of ["prov", "box", "pt"]) $("#mode-" + m).hidden = m !== mode;
  if (mode !== "box" && S.drawing) stopDraw();
}

function bindUI() {
  document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
  $("#sel-prov").addEventListener("change", (e) => selectPreset(e.target.value));
  $("#btn-draw").addEventListener("click", () => (S.drawing ? stopDraw() : startDraw()));
  $("#btn-pt").addEventListener("click", () => {
    const lat = +$("#in-lat").value, lon = +$("#in-lon").value, km = +$("#in-rad").value;
    const ids = cellsInCircle(lat, lon, km);
    S.areaName = `${t("circle")} ${km} km · ${lat.toFixed(2)}, ${lon.toFixed(2)}`; S.areaKind = "pt"; highlightProv(null);
    setSelection(ids, L.circle([lat, lon], { radius: km * 1000, color: "#151514", weight: 2, fill: false }));
    map.fitBounds(L.latLng(lat, lon).toBounds(km * 2600));
  });
  for (const s of ["#y0", "#y1"]) $(s).addEventListener("change", render);
  $("#sel-hl").addEventListener("change", () => renderSeason(S.A, YEARS()));
  document.querySelectorAll(".seg-b").forEach((b) => b.addEventListener("click", () => {
    S.view = b.dataset.view; document.querySelectorAll(".seg-b").forEach((x) => x.classList.toggle("on", x === b)); renderCalendar(S.A, YEARS());
  }));
  $("#chk-rawv").addEventListener("change", (e) => { S.showRawV = e.target.checked; renderYears(S.A, YEARS()); });
  $("#chk-num").addEventListener("change", (e) => { S.showNum = e.target.checked; renderCalendar(S.A, YEARS()); });
  $("#btn-csv").addEventListener("click", csvMonthly);
  $("#btn-raw").addEventListener("click", rawHotspots);
  $("#btn-lang").addEventListener("click", () => { S.lang = S.lang === "id" ? "en" : "id"; applyLang(); });
  // tooltip kalender
  const tip = $("#tip");
  $("#cal").addEventListener("mousemove", (e) => {
    const td = e.target.closest("td[data-i]"); if (!td) { tip.hidden = true; return; }
    tip.innerHTML = tipFor(+td.dataset.i); tip.hidden = false;
    const x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8), y = Math.min(e.clientY + 14, innerHeight - tip.offsetHeight - 8);
    tip.style.left = x + "px"; tip.style.top = y + "px";
  });
  $("#cal").addEventListener("mouseleave", () => (tip.hidden = true));
}

function applyLang() {
  document.documentElement.lang = S.lang;
  document.querySelectorAll("[data-i]").forEach((el) => {
    if (el.tagName === "TD") return; const k = el.dataset.i;
    if (T[S.lang][k] != null) el.innerHTML = T[S.lang][k];
  });
  $("#btn-lang").textContent = S.lang === "id" ? "EN" : "ID";
  if (S.drawing) $("#btn-draw").textContent = t("btn_draw_on");
  fillProvSelect();
  if (S.areaKind === "preset") selectPreset(S.preset); else if (S.sel) render();
}
