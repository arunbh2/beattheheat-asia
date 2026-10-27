#!/usr/bin/env python3
"""Voices a drawn film and times it to the voice.

Reads tools/films/<name>.narration.json (one line per scene; "|" splits a scene into beats that cue its cards),
speaks each part with Piper, then writes:
  - tools/films/<name>.timing.json   scene starts and lengths, and beat times, for render.js and the captions
  - media/films/<name>.voice.wav     the narration on one track, placed at each scene's start
Needs: pip install piper-tts, a Piper voice (.onnx and .onnx.json; set PIPER_VOICE to its path), and ffmpeg.
The LibriTTS voice (CC BY 4.0) is from https://github.com/rhasspy/piper/releases/tag/v0.0.2 (voice-en-us-libritts-high).
Usage:  PIPER_VOICE=/path/en-us-libritts-high.onnx python3 tools/films/narrate.py heat-and-lenders
"""
import json, os, subprocess, sys, tempfile, wave

name = sys.argv[1] if len(sys.argv) > 1 else "heat-and-lenders"
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(os.path.dirname(here))
cfg = json.load(open(os.path.join(here, name + ".narration.json"), encoding="utf-8"))
model, v = os.environ["PIPER_VOICE"], cfg["voice"]
LEAD, TAIL, GAP, MIN = 0.6, 1.1, 0.35, 5.0      # silence before speech, after it, between beats; shortest scene
tmp = tempfile.mkdtemp()

def speak(text, path):
    subprocess.run([sys.executable, "-m", "piper", "-m", model, "-s", str(v["speaker"]), "--length-scale", str(v["length_scale"]),
                    "--sentence-silence", "0.25", "-f", path], input=text.encode(), check=True, capture_output=True)
    with wave.open(path) as w: return w.getnframes() / w.getframerate()

scenes, t, clips = [], 0.0, []
for i, line in enumerate(cfg["scenes"]):
    beats, cursor = [], LEAD
    for j, part in enumerate(p.strip() for p in line.split("|")):
        path = os.path.join(tmp, f"s{i}b{j}.wav"); d = speak(part, path)
        beats.append(round(cursor, 2)); clips.append((t + cursor, path)); cursor += d + GAP
    length = round(max(MIN, cursor - GAP + TAIL), 2)
    scenes.append({"start": round(t, 2), "dur": length, "beats": beats, "text": line.replace(" | ", " ").replace("|", " ")})
    t += length
total = round(t, 2)
json.dump({"total": total, "scenes": scenes}, open(os.path.join(here, name + ".timing.json"), "w"), indent=1)

# one voice track: each clip delayed to its place, mixed together
out = os.path.join(root, "media", "films", name + ".voice.wav")
args = ["ffmpeg", "-v", "error", "-y"]
for _, p in clips: args += ["-i", p]
f = "".join(f"[{k}]adelay={int(s*1000)}|{int(s*1000)},apad=whole_dur={total}[a{k}];" for k, (s, _) in enumerate(clips))
f += "".join(f"[a{k}]" for k in range(len(clips))) + f"amix=inputs={len(clips)}:normalize=0,atrim=0:{total}[out]"
subprocess.run(args + ["-filter_complex", f, "-map", "[out]", "-ar", "48000", "-ac", "1", out], check=True)
print(f"{name}: {len(scenes)} scenes, {total} s, voice track {os.path.relpath(out, root)}")
