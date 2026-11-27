// Common Shade: reads facts from media files without any library, so nothing about a file is typed by hand.
//   image(file)  { width, height, type } for PNG, JPEG, WebP and SVG (SVG from its viewBox)
//   video(file)  { duration (seconds), width, height, audio (true when a sound track exists) } from an MP4's moov box
// Used by tools/build-brand.js and tools/check-brand.js. Returns null when a file cannot be read.
"use strict";
const fs = require("fs");

function image(file) {
  if (!fs.existsSync(file)) return null;
  if (/\.svg$/i.test(file)) {
    const t = fs.readFileSync(file, "utf8").slice(0, 2000), vb = t.match(/viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/);
    return vb ? { width: Math.round(+vb[1]), height: Math.round(+vb[2]), type: "image/svg+xml" } : null;
  }
  const b = fs.readFileSync(file);
  if (b.readUInt32BE(0) === 0x89504E47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20), type: "image/png" };
  if (b[0] === 0xFF && b[1] === 0xD8) {
    for (let i = 2; i < b.length - 9;) {
      if (b[i] !== 0xFF) { i++; continue; }
      const mk = b[i + 1], len = b.readUInt16BE(i + 2);
      if (mk >= 0xC0 && mk <= 0xCF && mk !== 0xC4 && mk !== 0xC8 && mk !== 0xCC) return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5), type: "image/jpeg" };
      i += 2 + len;
    }
    return null;
  }
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const k = b.toString("ascii", 12, 16);
    if (k === "VP8X") return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3), type: "image/webp" };
    if (k === "VP8 ") return { width: b.readUInt16LE(26) & 0x3FFF, height: b.readUInt16LE(28) & 0x3FFF, type: "image/webp" };
    if (k === "VP8L") { const v = b.readUInt32LE(21); return { width: (v & 0x3FFF) + 1, height: ((v >> 14) & 0x3FFF) + 1, type: "image/webp" }; }
  }
  return null;
}

// MP4: walk the top-level boxes with small reads (the moov box can sit at the end of a large file), then read moov
function video(file) {
  if (!fs.existsSync(file)) return null;
  const fd = fs.openSync(file, "r"), size = fs.fstatSync(fd).size, h = Buffer.alloc(16);
  let moov = null;
  try {
    for (let at = 0; at + 8 <= size;) {
      fs.readSync(fd, h, 0, 16, at);
      let len = h.readUInt32BE(0), hdr = 8; const type = h.toString("ascii", 4, 8);
      if (len === 1) { len = Number(h.readBigUInt64BE(8)); hdr = 16; } else if (len === 0) len = size - at;
      if (len < hdr) break;
      if (type === "moov") { moov = Buffer.alloc(len - hdr); fs.readSync(fd, moov, 0, len - hdr, at + hdr); break; }
      at += len;
    }
  } finally { fs.closeSync(fd); }
  if (!moov) return null;
  const kids = (buf, from, to) => { const out = []; for (let i = from; i + 8 <= to;) { const l = buf.readUInt32BE(i); if (l < 8) break; out.push({ type: buf.toString("ascii", i + 4, i + 8), s: i + 8, e: Math.min(i + l, to) }); i += l; } return out; };
  const top = kids(moov, 0, moov.length), r = { duration: null, width: null, height: null, audio: false };
  const mvhd = top.find(k => k.type === "mvhd");
  if (mvhd) { const v = moov[mvhd.s], ts = moov.readUInt32BE(mvhd.s + (v ? 20 : 12)), d = v ? Number(moov.readBigUInt64BE(mvhd.s + 24)) : moov.readUInt32BE(mvhd.s + 16); if (ts) r.duration = d / ts; }
  for (const t of top.filter(k => k.type === "trak")) {
    const tk = kids(moov, t.s, t.e), tkhd = tk.find(k => k.type === "tkhd"), mdia = tk.find(k => k.type === "mdia");
    const hdlr = mdia && kids(moov, mdia.s, mdia.e).find(k => k.type === "hdlr"), kind = hdlr ? moov.toString("ascii", hdlr.s + 8, hdlr.s + 12) : "";
    if (kind === "soun") r.audio = true;
    if (kind === "vide" && tkhd && !r.width) { const w = tkhd.e - 8; r.width = moov.readUInt32BE(w) >>> 16; r.height = moov.readUInt32BE(w + 4) >>> 16; }
  }
  return r;
}

const clock = s => s == null ? "" : `${Math.floor(Math.round(s) / 60)}:${String(Math.round(s) % 60).padStart(2, "0")}`;
const bytes = n => n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
module.exports = { image, video, clock, bytes };
