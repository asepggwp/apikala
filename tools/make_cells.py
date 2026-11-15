# SI notice: drafted with Super Intelligence (SI) assistance (Claude Opus 5.5 (medium effort), Anthropic) during NASA Space Apps 2026; reviewed and run by Team Occupy Mars.
"""Membuat peta sel grid 0,25 derajat -> provinsi & pulau (data/cells.json).

Batas provinsi: geoBoundaries IDN ADM1 (CC BY 4.0).
Dijalankan sekali; hasilnya dipakai notebook harmonisasi dan web app.
Pakai: python tools/make_cells.py data/idn_adm1_simplified.geojson data/cells.json
"""
import json
import sys

RES = 0.25
LON0, LAT0 = 94.0, -11.5
NCOL, NROW = 190, 72  # 94..141.5 E, -11.5..6.5 N

NAMA_ID = {
    "Aceh": "Aceh", "North Sumatra": "Sumatera Utara", "West Sumatra": "Sumatera Barat",
    "Riau": "Riau", "Riau Islands": "Kepulauan Riau", "Jambi": "Jambi", "Bengkulu": "Bengkulu",
    "South Sumatra": "Sumatera Selatan", "Bangka-Belitung Islands": "Kep. Bangka Belitung",
    "Lampung": "Lampung", "Banten": "Banten", "Jakarta Special Capital Region": "DKI Jakarta",
    "West Java": "Jawa Barat", "Central Java": "Jawa Tengah",
    "Special Region of Yogyakarta": "DI Yogyakarta", "East Java": "Jawa Timur", "Bali": "Bali",
    "West Nusa Tenggara": "Nusa Tenggara Barat", "East Nusa Tenggara": "Nusa Tenggara Timur",
    "West Kalimantan": "Kalimantan Barat", "Central Kalimantan": "Kalimantan Tengah",
    "South Kalimantan": "Kalimantan Selatan", "East Kalimantan": "Kalimantan Timur",
    "North Kalimantan": "Kalimantan Utara", "North Sulawesi": "Sulawesi Utara",
    "Gorontalo": "Gorontalo", "Central Sulawesi": "Sulawesi Tengah",
    "West Sulawesi": "Sulawesi Barat", "South Sulawesi": "Sulawesi Selatan",
    "Southeast Sulawesi": "Sulawesi Tenggara", "Maluku": "Maluku", "North Maluku": "Maluku Utara",
    "Papua": "Papua", "West Papua": "Papua Barat",
}
PULAU = {
    "Sumatra": ["Aceh", "North Sumatra", "West Sumatra", "Riau", "Riau Islands", "Jambi", "Bengkulu",
                "South Sumatra", "Bangka-Belitung Islands", "Lampung"],
    "Jawa-Bali": ["Banten", "Jakarta Special Capital Region", "West Java", "Central Java",
                  "Special Region of Yogyakarta", "East Java", "Bali"],
    "Nusa Tenggara": ["West Nusa Tenggara", "East Nusa Tenggara"],
    "Kalimantan": ["West Kalimantan", "Central Kalimantan", "South Kalimantan", "East Kalimantan",
                   "North Kalimantan"],
    "Sulawesi": ["North Sulawesi", "Gorontalo", "Central Sulawesi", "West Sulawesi", "South Sulawesi",
                 "Southeast Sulawesi"],
    "Maluku": ["Maluku", "North Maluku"],
    "Papua": ["Papua", "West Papua"],
}


def rings_of(geom):
    """Daftar poligon; tiap poligon = [ring luar, lubang...]."""
    if geom["type"] == "Polygon":
        return [geom["coordinates"]]
    return geom["coordinates"]


def in_ring(x, y, ring):
    inside = False
    n = len(ring)
    j = n - 1
    for i in range(n):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside


def main(src, dst):
    g = json.load(open(src, encoding="utf-8"))
    provs = []
    for f in g["features"]:
        name = f["properties"]["shapeName"]
        polys = rings_of(f["geometry"])
        xs = [p[0] for poly in polys for p in poly[0]]
        ys = [p[1] for poly in polys for p in poly[0]]
        verts = [(p[0], p[1]) for poly in polys for p in poly[0]]
        provs.append(dict(name=name, polys=polys, bbox=(min(xs), min(ys), max(xs), max(ys)), verts=verts))
    provs.sort(key=lambda p: p["name"])
    names = [p["name"] for p in provs]
    pulau_of = {n: k for k, v in PULAU.items() for n in v}
    assert set(names) == set(pulau_of), set(names) ^ set(pulau_of)
    pulau_list = list(PULAU)

    def prov_at(x, y):
        for idx, p in enumerate(provs):
            b = p["bbox"]
            if not (b[0] <= x <= b[2] and b[1] <= y <= b[3]):
                continue
            for poly in p["polys"]:
                if in_ring(x, y, poly[0]) and not any(in_ring(x, y, h) for h in poly[1:]):
                    return idx
        return None

    def nearest(x, y, maxd=0.3):
        best, bd = None, maxd * maxd
        for idx, p in enumerate(provs):
            b = p["bbox"]
            if x < b[0] - maxd or x > b[2] + maxd or y < b[1] - maxd or y > b[3] + maxd:
                continue
            for vx, vy in p["verts"]:
                d = (vx - x) ** 2 + (vy - y) ** 2
                if d < bd:
                    best, bd = idx, d
        return best

    cells = {}
    steps = [(k + 0.5) / 4 for k in range(4)]
    for r in range(NROW):
        for c in range(NCOL):
            x0, y0 = LON0 + c * RES, LAT0 + r * RES
            votes = {}
            for fx in steps:
                for fy in steps:
                    idx = prov_at(x0 + fx * RES, y0 + fy * RES)
                    if idx is not None:
                        votes[idx] = votes.get(idx, 0) + 1
            if votes:
                idx = max(votes, key=votes.get)
            else:
                idx = nearest(x0 + RES / 2, y0 + RES / 2)
            if idx is not None:
                cells[r * NCOL + c] = idx

    out = dict(
        res=RES, lon0=LON0, lat0=LAT0, ncol=NCOL, nrow=NROW,
        provinsi=[NAMA_ID[n] for n in names],
        provinsi_en=names,
        pulau=pulau_list,
        pulau_provinsi=[pulau_list.index(pulau_of[n]) for n in names],
        sel={str(k): v for k, v in sorted(cells.items())},
        sumber="geoBoundaries IDN ADM1 (CC BY 4.0), www.geoboundaries.org",
    )
    json.dump(out, open(dst, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"{len(cells)} sel terpetakan ke {len(names)} provinsi -> {dst}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
