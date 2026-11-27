#!/usr/bin/env python3
"""Common Shade: independently re-reads a sample of /heat-futures/ values from the World Bank CCKP source files, by
looking up the committed grid-cell coordinates directly (not the nearest-cell search extract.py uses), and writes
research/2026-11/heat-futures/reproduce.json, which tools/check-heat-futures.js compares with data/site/heat-futures.json.
Needs netCDF4 for this one-off step (pip install netCDF4).
  python3 research/2026-11/heat-futures/reproduce.py [cache-folder]
"""
import json, os, sys, urllib.request
import numpy as np, netCDF4
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
CACHE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "_cache2")
D = json.load(open(os.path.join(ROOT, "data", "site", "heat-futures.json")))
SAMPLE = [("delhi", "hd35", "ssp370", "2040-2059", "median"), ("bangkok", "tr26", "ssp126", "2020-2039", "p90"), ("manila", "txx", "ssp245", "2040-2059", "p10"),
          ("dhaka", "hd35", "historical", "1995-2014", "median"), ("jakarta", "tr26", "ssp370", "2040-2059", "median"), ("mumbai", "txx", "ssp126", "2020-2039", "median"),
          ("delhi", "tr26", "historical", "1995-2014", "p90"), ("bangkok", "hd35", "ssp245", "2040-2059", "p90")]
out = []
os.makedirs(CACHE, exist_ok=True)
for city, ind, scen, period, pct in SAMPLE:
    u = f"https://wbg-cckp.s3.amazonaws.com/data/cmip6-x0.25/{ind}/ensemble-all-{scen}/climatology-{ind}-annual-mean_cmip6-x0.25_ensemble-all-{scen}_climatology_{pct}_{period}.nc"
    f = os.path.join(CACHE, u.rsplit("/", 1)[1])
    if not os.path.exists(f): urllib.request.urlretrieve(u, f)
    ds = netCDF4.Dataset(f); c = D["cities"][city]["cell"]
    i = int(np.where(np.isclose(ds["lat"][:], c["lat"]))[0][0]); j = int(np.where(np.isclose(ds["lon"][:], c["lon"]))[0][0])
    v = [k for k in ds.variables if ds.variables[k].ndim >= 2][0]; a = ds.variables[v]
    val = float(a[0, i, j] if a.ndim == 3 else a[i, j]); ds.close()
    out.append({"city": city, "ind": ind, "scen": scen, "period": period, "pct": pct, "value": round(val, 2), "file": u})
json.dump({"about": "Independent re-read of a sample of heat-futures.json values from the source files (reproduce.py).", "samples": out}, open(os.path.join(os.path.dirname(__file__), "reproduce.json"), "w"), indent=1)
print(len(out), "samples")
