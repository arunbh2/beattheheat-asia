#!/usr/bin/env python3
"""A quiet music bed for the drawn films, synthesised from scratch (no samples, nothing to license).
A slow, warm pad (A minor, F, C, G) that settles on C major for the closing scene.
Usage: python3 tools/films/music.py out.wav seconds"""
import math, struct, sys, wave

out, dur = sys.argv[1], float(sys.argv[2])
SR = 22050; N = int(SR * dur)
note = lambda n: 440 * 2 ** ((n - 69) / 12)
CHORDS = [(57, 60, 64), (53, 57, 60), (48, 55, 64), (55, 59, 62)]   # Am, F, C, G (MIDI)
BAR = 8.0
buf = [0.0] * N
for i in range(N):
    t = i / SR
    closing = t > dur - 11
    ch = (48, 52, 55, 60) if closing else CHORDS[int(t // BAR) % 4]
    pos = (t % BAR) / BAR
    swell = 0.55 + 0.45 * math.sin(math.pi * pos) if not closing else 0.9
    v = 0.0
    for k, n in enumerate(ch):
        f = note(n)
        v += math.sin(2 * math.pi * f * t + k) * 0.6 + math.sin(2 * math.pi * f * 1.003 * t) * 0.4   # gently detuned pair
    v += 0.35 * math.sin(2 * math.pi * note(ch[0] - 12) * t)                                   # soft bass
    fade = min(1.0, t / 2.5, (dur - t) / 3.0)
    buf[i] = v * swell * fade * 0.055
with wave.open(out, "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, x)) * 32767)) for x in buf))
print("music bed:", out, f"{dur:.1f} s")
