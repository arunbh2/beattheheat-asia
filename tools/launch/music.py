#!/usr/bin/env python3
"""Music for the Common Shade launch film, synthesised from scratch (no samples, nothing to license).
It follows the film's beats: a soft opening on the map, a whoosh on the whip pan (3.5 s), a pulse that builds through
the orbit, a rise into the tagline, silence on the smash cut (13.0 to 13.6 s), then a warm C major resolve on the
reveal with a bell on the end card. Loudness is set later by ffmpeg (loudnorm to about -16 LUFS).
Usage: python tools/launch/music.py out.wav [seconds] [full|gentle]"""
import sys, wave
import numpy as np

out = sys.argv[1]; DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 20.0
GENTLE = len(sys.argv) > 3 and sys.argv[3] == "gentle"
SR = 44100; t = np.arange(int(SR * DUR)) / SR
rng = np.random.default_rng(7)                     # fixed seed: the same music on every render
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
def env(a, b, attack=0.02, release=0.3):
    """1 between a and b seconds, with soft edges."""
    e = np.clip((t - a) / attack, 0, 1) * np.clip((b - t) / release, 0, 1)
    return e * ((t >= a) & (t <= b))
def pad(notes, a, b, gain, attack=0.8, release=0.8):
    e = env(a, b, attack, release); s = np.zeros_like(t)
    for k, n in enumerate(notes):
        f = hz(n); s += np.sin(2 * np.pi * f * t + k) * .6 + np.sin(2 * np.pi * f * 1.004 * t) * .4
    return s * e * gain
def pluck(n, at, gain, decay=6.0):
    m = t >= at; x = np.zeros_like(t); tt = t[m] - at
    x[m] = (np.sin(2 * np.pi * hz(n) * tt) + .35 * np.sin(4 * np.pi * hz(n) * tt)) * np.exp(-decay * tt) * np.clip(tt / .004, 0, 1)
    return x * gain
def bell(n, at, gain):
    m = t >= at; x = np.zeros_like(t); tt = t[m] - at
    for r, g, d in [(1, 1, 2.2), (2.76, .45, 3.5), (5.4, .2, 5.0)]:
        x[m] += g * np.sin(2 * np.pi * hz(n) * r * tt) * np.exp(-d * tt)
    return x * gain
def kick(at, gain):
    m = t >= at; x = np.zeros_like(t); tt = t[m] - at
    x[m] = np.sin(2 * np.pi * (48 + 70 * np.exp(-30 * tt)) * tt) * np.exp(-9 * tt)
    return x * gain
def lowpass(x, k):
    """A cheap one-pole low-pass, k in 0..1 per sample (array or scalar)."""
    y = np.zeros_like(x); acc = 0.0; k = np.broadcast_to(k, x.shape)
    for i in range(len(x)): acc += k[i] * (x[i] - acc); y[i] = acc
    return y

mix = np.zeros_like(t)
# 0 to 3.5 s: the map, a soft A minor pad and a gentle arpeggio
mix += pad([45, 57, 60, 64], 0, 3.6, .05, attack=1.2, release=.4)
arp = [69, 72, 76, 72]
for i, at in enumerate(np.arange(.9, 3.5, .25)): mix += pluck(arp[i % 4], at, .06 if GENTLE else .07)
# 3.5 s: the whoosh of the whip pan (filtered noise swelling and falling)
if not GENTLE:
    w = env(3.25, 4.15, attack=.25, release=.5) * np.sin(np.pi * np.clip((t - 3.25) / .9, 0, 1))
    noise = rng.standard_normal(len(t)) * w
    mix += lowpass(noise, np.clip(.02 + .25 * w, 0, 1)) * .6
# 4 to 9 s: the orbit, F to C to G with a pulse that builds
for (notes, a, b) in [([41, 53, 57, 60], 4.0, 5.7), ([48, 55, 60, 64], 5.7, 7.4), ([43, 55, 59, 62], 7.4, 9.1)]:
    mix += pad(notes, a, b, .055, attack=.4, release=.4)
arp2 = [[65, 69, 72, 77], [67, 72, 76, 79], [67, 71, 74, 79]]
for i, at in enumerate(np.arange(4.0, 9.0, .25 if GENTLE else .125)):
    bar = 0 if at < 5.7 else 1 if at < 7.4 else 2
    mix += pluck(arp2[bar][i % 4], at, .04 + .03 * (at - 4) / 5)
if not GENTLE:
    for at in np.arange(4.0, 9.0, .5): mix += kick(at, .22 + .1 * (at - 4) / 5)
# 9 to 13 s: the rise into the tagline, then cut dead at 13.0 s
rise = np.clip((t - 9) / 4, 0, 1) * (t < 13.0)
mix += pad([45, 57, 64, 69, 72], 9.0, 13.0, .07, attack=.6, release=.01) * (.5 + .7 * rise)
sweep = np.sin(2 * np.pi * np.cumsum(220 + 660 * rise ** 2) / SR) * rise ** 2 * (t < 13.0)
mix += sweep * (.025 if GENTLE else .04)
if not GENTLE: mix += lowpass(rng.standard_normal(len(t)), np.clip(.01 + .3 * rise, 0, 1)) * rise ** 3 * .35 * (t < 13.0)
# 13.0 to 13.6 s: silence (the smash cut)
mix[(t >= 13.0) & (t < 13.6)] = 0
# 13.6 to 20 s: the reveal, a low boom and a warm C major that settles, a bell on the end card
mix += kick(13.6, .5 if not GENTLE else .25)
mix += pad([36, 48, 55, 60, 64, 67], 13.6, DUR, .06, attack=.08, release=1.6)
for i, at in enumerate(np.arange(14.2, 17.0, .375)): mix += pluck([72, 76, 79, 84][i % 4], at, .035)
mix += bell(84, 16.6, .09) + bell(79, 17.4, .05)

mix *= np.clip((DUR - t) / .5, 0, 1)                   # a short fade at the very end
mix /= max(1e-9, np.max(np.abs(mix))) / .8
st = np.stack([mix * .98, np.roll(mix, int(SR * .012)) * .92], axis=1)   # a little width
with wave.open(out, "w") as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((np.clip(st, -1, 1) * 32767).astype("<i2").tobytes())
print("launch music:", out, f"{DUR:.1f} s", "gentle" if GENTLE else "full")
