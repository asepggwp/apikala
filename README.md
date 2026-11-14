# 🔥 ApiKala — Indonesia's harmonized fire calendar (MODIS + VIIRS, 2000–today)

**NASA Space Apps Challenge 2026 · Challenge: _Harmonization of MODIS and VIIRS Hot Spots_ · Team Occupy Mars (Bandung, Indonesia)**

*Api* = fire, *Kala* = time/season (Indonesian). ApiKala turns 25+ years of NASA FIRMS active-fire hotspots into one consistent
**burning-activity calendar** so fire managers can see, for any area of Indonesia, *when* the fire season peaks,
*which* years were worst, and *whether this month is unusual*.

## The problem
Indonesia's forest and peatland fires return almost every year. The satellite record that could tell responders what is
"normal" is split between two sensors:

| | MODIS (Terra/Aqua) | VIIRS (S-NPP, NOAA-20, NOAA-21) |
|---|---|---|
| Pixel size | ~1 km | ~375 m |
| Record | Nov 2000 – today (ending) | 2012 – today (continuing) |
| Hotspots for the same fire | fewer | several times more |

Joining them naively makes fire activity appear to explode after 2012. On top of that, S-NPP stopped delivering new
data on 2 Nov 2026 and MODIS is near the end of its life, so the long record will break unless it is harmonized.

## What ApiKala does
1. **Harmonizes** every month to one unit, "MODIS-equivalent hotspots" (method below).
2. **Calendar heatmap** (year × month) for any area: a province, an island, a box drawn on the map, or a lat/lon + radius.
3. **Anomaly view**: each month vs the median of the same month over all complete years; the current, partial month is
   compared with a pro-rated median and labelled *below normal / normal / above normal / far above normal*.
4. **Fire-season profile** (median and 25–75% range by month, highlighted year) and **annual totals** with raw sensor lines.
5. **Downloads**: monthly CSV for the selected area (raw MODIS, raw VIIRS, k, harmonized, median, anomaly) and raw
   hotspot CSV fetched live from the FIRMS API with the user's own MAP_KEY.
6. Bilingual UI (English / Bahasa Indonesia), accessible color ramps (single-hue sequential, blue–grey–red diverging),
   tooltips with the per-sensor breakdown.

## Harmonization method
* **Data**: NASA FIRMS Country Yearly Summaries for Indonesia: MODIS C6.1 (Terra+Aqua), VIIRS 375 m S-NPP, NOAA-20,
  NOAA-21. Years without an archive file yet (current year) come from the FIRMS API (Standard Processing first,
  Near-Real-Time otherwise).
* **Filters**: MODIS confidence ≥ 30; VIIRS confidence nominal/high; `type = 0` (presumed vegetation fire).
* **Aggregation**: counts per 0.25° grid cell × month, each cell mapped to one of 34 provinces / 7 island groups
  (geoBoundaries ADM1).
* **Target unit: MODIS (Terra+Aqua) equivalent**
  * Nov 2000 – Jun 2002 (Terra only) × `k_TA = Σ(Terra+Aqua) / ΣTerra` (2003–2011).
  * Months without full S-NPP coverage (Nov 2026 onward): NOAA-20 × `k_N20 = ΣS-NPP / ΣNOAA-20` (NOAA-21 as backup).
  * From 2012: `H = VIIRS × k[island, calendar month]`, `k = ΣMODIS / ΣVIIRS` over the overlap years **2012–2021**
    (chosen to avoid the Terra/Aqua orbit drift of recent years). Sparse island-months fall back to the island's annual k,
    then the national monthly k. 95% CIs come from a bootstrap over years.
* **Validation**: leave-one-year-out. k is recomputed without year *y* and used to predict year *y*'s MODIS count
  (R², bias, median absolute % error), compared against using raw VIIRS. Results are shown in the app.

## External check against official burned area (SIPONGI KEMENHUT)
Harmonized hotspot counts were compared with the Indonesian Ministry of Forestry's official burned-area table
(SIPONGI KEMENHUT, *Rekapitulasi Luas Kebakaran Hutan dan Lahan per Provinsi*, 2018–2026, 2026 to July):
* **225 province-years (2018–2024): r = 0.825 on log scales, Spearman ρ = 0.859**; national by year r = 0.966.
* Jan–Jul 2026 vs earlier years: SiPongi reports +47% vs 2019, +80% vs 2023, +69% vs 2025; ApiKala hotspots show
  +12%, +55%, +56%. Same direction in all three cases (hotspots are not burned area, so magnitudes differ).
* 2025 is excluded because the table's 2025 column contradicts the note on the same page (probably incomplete).
* Script: `tools/validasi_sipongi.py`; data: `data/sipongi_luas_karhutla_2018_2026.csv` (source: SIPONGI KEMENHUT).

## Repository
```
pipeline/harmonisasi.py      download → filter → aggregate → harmonize → validate → export
notebook/ApiKala_Harmonisasi.ipynb   same pipeline, ready for Google Colab (Runtime → Run all)
tools/make_cells.py          builds data/cells.json (0.25° cell → province / island)
tools/make_notebook.py       assembles the Colab notebook from the pipeline
docs/                        static web app (GitHub Pages) (Leaflet + plain JS/SVG); docs/data/*.json produced by the pipeline
```

### Run it
1. Get a free FIRMS MAP_KEY: https://firms.modaps.eosdis.nasa.gov/api/map_key/
2. Open `notebook/ApiKala_Harmonisasi.ipynb` in Google Colab → *Run all* → paste the MAP_KEY → unzip `data_web.zip` into `docs/data/`.
3. Serve `docs/` (e.g. `python -m http.server` inside `docs/`) or publish with GitHub Pages (Settings → Pages → branch main, folder /docs).

## Limitations
* 0.25° cells (~28 km): areas are approximated by the cells whose centre falls inside them.
* Hotspot counts are not burned area; one large fire produces many hotspots. Cloud and smoke hide fires.
* k assumes the MODIS/VIIRS relationship per island and month is stable; recent MODIS orbit drift is excluded from the fit
  but MODIS-only months before 2012 inherit MODIS's own detection limits.
* The current-year API data near the border use a bounding box filtered to Indonesian grid cells.

## Data & credits
* NASA FIRMS: *We acknowledge the use of data and/or imagery from NASA's Fire Information for Resource Management System
  (FIRMS) (https://earthdata.nasa.gov/firms), part of NASA's Earth Science Data and Information System (ESDIS).*
  MODIS Collection 6.1 (MCD14), VIIRS 375 m (VNP14IMG, VJ114IMG, VJ214IMG).
* Official burned area: SIPONGI KEMENHUT (https://sipongi.gakkum.kehutanan.go.id/indikasi-luas-kebakaran).
* Province boundaries: geoBoundaries IDN ADM1, CC BY 4.0 (Runfola et al. 2020).
* Basemap: © OpenStreetMap contributors. Map library: Leaflet (BSD-2).
* NASA does not endorse this project.

## Use of Super Intelligence (SI) tools
Built with help from Claude (Anthropic) as a coding and learning assistant: explaining the MODIS/VIIRS concepts,
drafting the Python pipeline and the web app, generating the team logo, and reviewing text. All code was created during
the hackathon (14–15 Nov 2026), run and checked by the team, and the harmonization results come from NASA FIRMS data,
not from the AI.
