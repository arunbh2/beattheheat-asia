"""A 20-second soundtrack for the reel, synthesised from scratch and timed to its cuts.
A warm pad, a soft pulse, and hits, whooshes and ticks where the picture moves.
Usage: python3 tools/reel/sound.py out.wav"""
import math, random, struct, sys, wave

SR, DUR = 48000, 20.0
N = int(SR * DUR)
L = [0.0] * N
R = [0.0] * N
random.seed(4)

def add(t, samples, gain=1.0, pan=0.0):
    i0 = int(t * SR)
    gl, gr = gain * (1 - max(0, pan)), gain * (1 + min(0, pan))
    for k, v in enumerate(samples):
        i = i0 + k
        if 0 <= i < N:
            L[i] += v * gl
            R[i] += v * gr

def kick(f0=140, f1=42, dur=.45):
    out, ph = [], 0.0
    for k in range(int(dur * SR)):
        s = k / SR
        f = f1 + (f0 - f1) * math.exp(-s * 28)
        ph += 2 * math.pi * f / SR
        out.append(math.sin(ph) * math.exp(-s * 7))
    return out

def noise_burst(dur, lp_start, lp_end, attack=.02, curve=3.0):
    out, y = [], 0.0
    n = int(dur * SR)
    for k in range(n):
        s = k / n
        cut = lp_start + (lp_end - lp_start) * s
        a = 1 - math.exp(-2 * math.pi * cut / SR)
        y += a * (random.uniform(-1, 1) - y)
        env = min(1, (k / SR) / attack) * (1 - s) ** curve if attack else (1 - s) ** curve
        out.append(y * env)
    return out

def whoosh(dur=.5, up=True):
    out, y = [], 0.0
    n = int(dur * SR)
    for k in range(n):
        s = k / n
        cut = 300 + 5200 * (s if up else 1 - s)
        a = 1 - math.exp(-2 * math.pi * cut / SR)
        y += a * (random.uniform(-1, 1) - y)
        out.append(y * math.sin(math.pi * s) ** 1.6)
    return out

def tone(freqs, dur, decay, gain=1.0, attack=.004):
    out = []
    for k in range(int(dur * SR)):
        s = k / SR
        env = min(1, s / attack) * math.exp(-s * decay)
        out.append(gain * env * sum(math.sin(2 * math.pi * f * s) / len(freqs) for f in freqs))
    return out

def hit(t, g=1.0):
    add(t, kick(), .9 * g)
    add(t, noise_burst(.3, 6000, 800, attack=.001, curve=4), .28 * g)

# pad: A major, slow swell in, a lift for the lockup, out at the end
for k in range(N):
    s = k / SR
    env = min(1, s / 2.5) * min(1, (DUR - s) / 1.2) * (.55 + .45 * min(1, max(0, (s - 17.6) / .6)))
    lfo = .75 + .25 * math.sin(2 * math.pi * .25 * s)
    v = (math.sin(2 * math.pi * 110 * s) + .7 * math.sin(2 * math.pi * 164.81 * s + .3) + .55 * math.sin(2 * math.pi * 277.18 * s + .9)
         + .3 * math.sin(2 * math.pi * 220.6 * s)) * .05 * env * lfo
    L[k] += v
    R[k] += v * .96

# a soft pulse at 100 bpm through the middle of the piece
beat = 60 / 100
t = 2.4
while t < 17.4:
    add(t, kick(110, 45, .3), .32)
    add(t + beat / 2, noise_burst(.05, 9000, 7000, attack=.0005, curve=6), .06, pan=.3)
    t += beat

# 1. ignite
add(0.05, tone([55, 82.5], 2.2, 1.4, attack=.6), .5)
hit(0.3, .7)
for i in range(7):
    add(0.7 + i * .045, tone([660 + i * 40], .12, 30), .07, pan=-.3 + i * .1)
hit(1.05, 1.0)
add(1.95, whoosh(.45, True), .45)
# 2. wicked
add(2.38, whoosh(.4, False), .4)
hit(2.84, .8); hit(3.0, .9)
add(3.3, noise_burst(.35, 2500, 9000, attack=.01, curve=1.5), .12, pan=.4)
for i in range(3):
    add(3.75 + i * .22, tone([880, 1320], .25, 14), .08)
# 3. the web
add(4.4, whoosh(.6, True), .5)
hit(4.85, .8)
for i in range(10):
    add(5.0 + i * .05, tone([440 * 2 ** (i / 12 * 2)], .3, 10), .06, pan=-.5 + i * .1)
for i in range(87):
    add(5.9 + i * .016, tone([1800 + (i % 7) * 140], .05, 60), .035, pan=random.uniform(-.6, .6))
add(8.2, whoosh(.55, True), .5)
# 4. the cycle: a heartbeat that quickens, then the cut
tau = 0.0
while True:
    tt = 9.25 + tau
    if tt > 10.55:
        break
    add(tt, kick(90, 40, .25), .5); add(tt + .09, kick(80, 38, .2), .3)
    tau += max(.18, .62 - .38 * tau)
add(10.6, tone([110, 220, 330, 440], 1.4, 2.2), .35)
hit(10.62, 1.2)
add(10.62, noise_burst(1.2, 8000, 1500, attack=.001, curve=2), .18)
add(11.45, whoosh(.7, True), .45)
# 5. people
add(12.85, kick(70, 35, .4), .7)
add(12.85, noise_burst(.25, 1800, 400, attack=.002, curve=3), .2)
for i in range(4):
    add(13.6 + i * .625, tone([1046.5, 1568], .2, 18), .05, pan=.4)
for i, tt in enumerate([13.2, 13.55, 13.95]):
    add(tt, tone([523.25 * 1.25 ** i, 784 * 1.25 ** i], .4, 9), .1)
add(14.6, whoosh(.45, False), .45)
# 6. five tools
for i in range(5):
    add(15.45 + i * .14, whoosh(.22, True), .22, pan=.5)
    add(15.55 + i * .14, tone([659.25 * 2 ** (i * 2 / 12)], .18, 16), .06)
add(17.0, whoosh(.5, True), .4)
# 7. lockup
hit(17.75, 1.0)
add(17.75, tone([880, 1318.5, 1760, 2217], 2.0, 1.6), .16)
for i in range(16):
    add(18.35 + i * .031, tone([2400], .02, 120), .03)
add(18.75, tone([523.25, 659.25, 783.99], .8, 4), .14)

# soft limiter and normalise
peak = max(max(abs(v) for v in L), max(abs(v) for v in R))
g = .89 / peak
def lim(v):
    v *= g
    return math.tanh(v * 1.2) / math.tanh(1.2)
with wave.open(sys.argv[1] if len(sys.argv) > 1 else "reel-sound.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b"".join(struct.pack("<hh", int(lim(a) * 32767), int(lim(b) * 32767)) for a, b in zip(L, R)))
