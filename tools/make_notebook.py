# SI notice: drafted with Super Intelligence (SI) assistance (Claude, Anthropic) during NASA Space Apps 2026; reviewed and run by Team Occupy Mars.
"""Merakit notebook Colab (notebook/ApiKala_Harmonisasi.ipynb) dari pipeline/harmonisasi.py + data/cells.json."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
kode = open(os.path.join(ROOT, "pipeline/harmonisasi.py"), encoding="utf-8").read()
cells = open(os.path.join(ROOT, "data/cells.json"), encoding="utf-8").read()


def md(t):
    return dict(cell_type="markdown", metadata={}, source=t.strip("\n").splitlines(keepends=True))


def code(t):
    return dict(cell_type="code", metadata={}, execution_count=None, outputs=[],
                source=t.strip("\n").splitlines(keepends=True))


nb_cells = [
    md("""
# 🔥 ApiKala — Harmonisasi MODIS–VIIRS
**NASA Space Apps Challenge 2026 · Tim Occupy Mars (Bandung)**

Notebook ini mengunduh titik api NASA FIRMS untuk Indonesia (MODIS 2000–sekarang, VIIRS S-NPP / NOAA-20 / NOAA-21),
menyamakan satuannya ("setara MODIS"), menguji hasilnya, lalu mengekspor data kecil untuk web app.

**Cara pakai:** `Runtime → Run all`. Saat diminta, tempel MAP_KEY FIRMS Anda. Di akhir, file `data_web.zip` terunduh otomatis.
"""),
    md("## 1. MAP_KEY FIRMS\nKunci tidak disimpan di notebook (pakai `getpass`)."),
    code("""
from getpass import getpass
MAP_KEY = getpass("Tempel MAP_KEY FIRMS lalu Enter: ").strip()
print("MAP_KEY terisi:", len(MAP_KEY), "karakter")
"""),
    md("## 2. Kode pipeline\nKode yang sama ada di repo GitHub: `pipeline/harmonisasi.py`."),
    code("%%writefile harmonisasi.py\n" + kode),
    code("%%writefile cells.json\n" + cells),
    md("## 3. Uji koneksi (satu file)"),
    code("""
import json, importlib, harmonisasi as h
importlib.reload(h)
cells = json.load(open("cells.json"))
dl = h.Pengunduh(MAP_KEY, cache="cache")
uji = dl.tahunan("MODIS", 2019)
print("Arsip tahunan MODIS 2019:", "OK, %d baris" % uji.count("\\n") if uji else "GAGAL (akan memakai API)")
uji2 = dl.api("VIIRS_NOAA20_NRT", __import__("datetime").date.today() - __import__("datetime").timedelta(days=3), 1)
print("FIRMS API (NOAA-20 NRT):", "OK, %d baris" % uji2.count("\\n") if uji2 else "GAGAL — cek MAP_KEY")
"""),
    md("## 4. Jalankan semuanya\nUnduhan pertama ±10–30 menit. Hasil per tahun disimpan di folder `cache/`, jadi kalau terputus cukup jalankan ulang sel ini."),
    code("""
lebar, ktab, info, val, pred = h.jalankan(MAP_KEY, cells, keluar="web/data", cache="cache", overlap=(2012, 2021))
"""),
    md("## 5. Lihat hasil"),
    code("""
import pandas as pd, matplotlib.pyplot as plt
nas = lebar.groupby("m")[["M", "V", "H"]].sum()
nas.index = pd.to_datetime([h.label_bulan(i) for i in nas.index])
fig, ax = plt.subplots(figsize=(13, 4))
ax.plot(nas.index, nas["V"], color="#bbbbbb", lw=1, label="VIIRS mentah")
ax.plot(nas.index, nas["M"], color="#1f77b4", lw=1.2, label="MODIS mentah (Terra+Aqua)")
ax.plot(nas.index, nas["H"], color="#d62728", lw=1.6, label="Harmonis (setara MODIS)")
ax.set_ylabel("titik api / bulan"); ax.set_title("Indonesia — titik api bulanan"); ax.legend(); plt.show()
"""),
    code("""
print("Faktor k per pulau × bulan (ΣMODIS/ΣVIIRS, tumpang tindih 2012–2021):")
display(ktab.pivot(index="pulau", columns="bulan", values="k").round(3))
print("\\nValidasi leave-one-year-out:")
display(pd.DataFrame({k: {**{f"harmonis_{a}": b for a, b in v["harmonis"].items()},
                          **{f"mentah_{a}": b for a, b in v["viirs_mentah"].items()}, "n_bulan": v["n_bulan"]}
                      for k, v in val.items() if v}).T)
"""),
    md("## 6. Unduh data untuk web app\nEkstrak `data_web.zip` ke folder `docs/data/` di repo GitHub."),
    code("""
import shutil
shutil.make_archive("data_web", "zip", "web/data")
try:
    from google.colab import files
    files.download("data_web.zip")
except Exception:
    print("Unduh manual: panel Files (kiri) → data_web.zip")
"""),
]

nb = dict(cells=nb_cells, metadata=dict(kernelspec=dict(name="python3", display_name="Python 3"),
                                        language_info=dict(name="python"), colab=dict(provenance=[])),
          nbformat=4, nbformat_minor=5)
os.makedirs(os.path.join(ROOT, "notebook"), exist_ok=True)
dst = os.path.join(ROOT, "notebook/ApiKala_Harmonisasi.ipynb")
json.dump(nb, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("notebook ->", dst)
