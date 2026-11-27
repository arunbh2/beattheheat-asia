#!/usr/bin/env python3
"""Common Shade: writes the independent reference values that tools/check-wet-bulb.js tests wet-bulb-wall/wetbulb-core.js
against. CoolProp's humid-air model (HAPropsSI, ASHRAE RP-1485, a real-gas formulation, independent of the ASHRAE
Handbook ideal-gas equations the page uses) gives the thermodynamic wet-bulb temperature at each point.
One-off; needs CoolProp (pip install CoolProp), which is not a site dependency.
  python3 research/2026-11/wet-bulb-wall/reference.py
"""
import json, os, CoolProp
from CoolProp.HumidAirProp import HAPropsSI
HERE = os.path.dirname(os.path.abspath(__file__))
pts = []
for p in (101325, 98000):
    for t in (20, 25, 30, 33, 35, 38, 40, 42, 45, 48, 50):
        for rh in (5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100):
            tw = HAPropsSI("B", "T", t + 273.15, "P", p, "R", rh / 100) - 273.15
            pts.append({"t": t, "rh": rh, "p": p, "tw": round(tw, 4)})
json.dump({"about": "Thermodynamic wet-bulb temperatures from CoolProp HAPropsSI (humid air, ASHRAE RP-1485), the independent reference for tools/check-wet-bulb.js.", "coolprop": CoolProp.__version__, "points": pts}, open(os.path.join(HERE, "reference.json"), "w"), indent=0)
print(len(pts), "points, CoolProp", CoolProp.__version__)
