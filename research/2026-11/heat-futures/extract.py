#!/usr/bin/env python3
"""Common Shade: extracts the climate projections behind /heat-futures/ from the World Bank Climate Change Knowledge
Portal's CMIP6 0.25-degree collection (cmip6-x0.25), public bulk files on AWS (s3://wbg-cckp).

For each of six cities it reads the ONE grid cell nearest the city centre (the coordinates the site already uses, in
data.js LIVE_CITIES), or the nearest cell with data when that cell is sea, and records:
  indicators   hd35 (days with Tmax > 35 C), tr26 (nights with Tmin > 26 C), txx (hottest day of the year, C)
  periods      1995-2014 (historical model run, the reference), 2020-2039, 2040-2059 (20-year climatologies)
  scenarios    SSP1-2.6, SSP2-4.5, SSP3-7.0
  percentiles  p10, median, p90 of the multi-model ensemble (Ensemble_all)
Values are the files' own numbers, rounded only for display (one decimal). Nothing is interpolated between periods.

Run once by a maintainer; the result, data/site/heat-futures.json, is committed and is all the page reads.
Needs the netCDF4 Python package for this one-off step only (pip install netCDF4); it is not a site dependency.
  python3 research/2026-11/heat-futures/extract.py [cache-folder]
tools/check-heat-futures.js re-reads nothing from AWS; research/2026-11/heat-futures/reproduce.py re-extracts a sample
with h5py-free raw reads to confirm the committed numbers.
"""
import json, math, os, sys, urllib.request, datetime
import netCDF4

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
CACHE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "research", "2026-11", "heat-futures", "_cache")
BASE = "https://wbg-cckp.s3.amazonaws.com/data/cmip6-x0.25"
CITIES = [("mumbai", "Mumbai", 19.08, 72.88), ("delhi", "Delhi", 28.61, 77.21), ("dhaka", "Dhaka", 23.81, 90.41),
          ("jakarta", "Jakarta", -6.21, 106.85), ("bangkok", "Bangkok", 13.75, 100.5), ("manila", "Manila", 14.6, 120.98)]
INDS = ["hd35", "tr26", "txx"]
SCEN = ["ssp126", "ssp245", "ssp370"]
FUT = ["2020-2039", "2040-2059"]
PCT = ["p10", "median", "p90"]

def url(ind, scen, pct, period):
    return f"{BASE}/{ind}/ensemble-all-{scen}/climatology-{ind}-annual-mean_cmip6-x0.25_ensemble-all-{scen}_climatology_{pct}_{period}.nc"

def fetch(u):
    os.makedirs(CACHE, exist_ok=True)
    f = os.path.join(CACHE, u.rsplit("/", 1)[1])
    if not os.path.exists(f):
        urllib.request.urlretrieve(u, f)
    return f

def var_of(ds):
    names = [v for v in ds.variables if ds.variables[v].ndim >= 2]
    return ds.variables[names[0]], names[0]

def cell(ds, lat, lon):
    la, lo = ds.variables["lat"][:], ds.variables["lon"][:]
    v, _ = var_of(ds)
    data = v[0] if v.ndim == 3 else v
    best = None
    i0 = int(abs(la - lat).argmin()); j0 = int(abs(lo - lon).argmin())
    for di in range(-3, 4):
        for dj in range(-3, 4):
            i, j = i0 + di, j0 + dj
            x = data[i, j]
            if x is None or (hasattr(x, "mask") and x.mask) or (isinstance(x, float) and math.isnan(x)):
                continue
            d = math.hypot((float(la[i]) - lat) * 111.0, (float(lo[j]) - lon) * 111.0 * math.cos(math.radians(lat)))
            if best is None or d < best[0]:
                best = (d, i, j)
    return best

out = {"about": "Grid-cell climate projections for /heat-futures/, extracted by research/2026-11/heat-futures/extract.py from the World Bank CCKP cmip6-x0.25 collection. Do not edit by hand.",
       "source": {"name": "World Bank Climate Change Knowledge Portal, CMIP6 0.25-degree collection (cmip6-x0.25)", "bulk": "https://wbg-cckp.s3.amazonaws.com/data/cmip6-x0.25/", "docs": "https://github.com/worldbank/climateknowledgeportal/blob/main/docs/collections/cmip6-x0.25.md", "retrieved": datetime.date.today().isoformat()},
       "reference": "1995-2014", "periods": FUT, "scenarios": SCEN, "percentiles": PCT, "indicators": INDS, "cities": {}, "files": {}}
for cid, name, lat, lon in CITIES:
    rec = {"name": name, "centre": [lat, lon], "values": {}}
    for ind in INDS:
        for scen, period in [("historical", "1995-2014")] + [(s, p) for s in SCEN for p in FUT]:
            for pct in PCT:
                u = url(ind, scen, pct, period)
                ds = netCDF4.Dataset(fetch(u))
                v, vname = var_of(ds)
                b = cell(ds, lat, lon)
                if b is None:
                    raise SystemExit(f"no data near {name} in {u}")
                d, i, j = b
                data = v[0] if v.ndim == 3 else v
                val = float(data[i, j])
                if "cell" not in rec:
                    rec["cell"] = {"lat": round(float(ds.variables["lat"][i]), 3), "lon": round(float(ds.variables["lon"][j]), 3), "km_from_centre": round(d, 1)}
                elif abs(rec["cell"]["lat"] - float(ds.variables["lat"][i])) > 1e-6 or abs(rec["cell"]["lon"] - float(ds.variables["lon"][j])) > 1e-6:
                    raise SystemExit(f"{name}: a different cell was chosen for {u}; the grid or mask differs between files")
                rec["values"].setdefault(ind, {}).setdefault(scen, {}).setdefault(period, {})[pct] = round(val, 2)
                out["files"].setdefault(u, {"variable": vname, "units": getattr(v, "units", ""), "long_name": getattr(v, "long_name", "")})
                ds.close()
    out["cities"][cid] = rec
    print(name, rec["cell"])
json.dump(out, open(os.path.join(ROOT, "data", "site", "heat-futures.json"), "w"), indent=1)
print("wrote data/site/heat-futures.json")
