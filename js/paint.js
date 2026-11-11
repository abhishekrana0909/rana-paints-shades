// Photo painter: click a wall in a real photo, it gets recoloured while keeping light and shadow.
(function () {
  const srgb2lin = new Float32Array(256);
  for (let i = 0; i < 256; i++) { const v = i / 255; srgb2lin[i] = v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }
  const F = t => t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const FI = t => { const t3 = t * t * t; return t3 > .008856 ? t3 : (t - 16 / 116) / 7.787; };
  function rgb2lab(r, g, b, out, o) {
    r = srgb2lin[r]; g = srgb2lin[g]; b = srgb2lin[b];
    const x = F((r * .4124 + g * .3576 + b * .1805) / .95047), y = F(r * .2126 + g * .7152 + b * .0722), z = F((r * .0193 + g * .1192 + b * .9505) / 1.08883);
    out[0][o] = 116 * y - 16; out[1][o] = 500 * (x - y); out[2][o] = 200 * (y - z);
  }
  function lab2rgb(L, a, b) {
    const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
    const x = FI(fx) * .95047, y = FI(fy), z = FI(fz) * 1.08883;
    let r = x * 3.2406 + y * -1.5372 + z * -.4986, g = x * -.9689 + y * 1.8758 + z * .0415, bl = x * .0557 + y * -.2040 + z * 1.0570;
    const gm = v => { v = v <= 0 ? 0 : v >= 1 ? 1 : v; return 255 * (v <= .0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - .055); };
    return [gm(r), gm(g), gm(bl)];
  }
  const hexLab = h => { const o = [[0], [0], [0]]; rgb2lab(parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), o, 0); return [o[0][0], o[1][0], o[2][0]]; };
  function boxBlur(src, W, H, r) {
    const tmp = new Float32Array(W * H), out = new Float32Array(W * H), n = 2 * r + 1;
    for (let y = 0; y < H; y++) { let s = 0; const o = y * W; for (let x = -r; x <= r; x++) s += src[o + Math.min(W - 1, Math.max(0, x))]; for (let x = 0; x < W; x++) { tmp[o + x] = s / n; s += src[o + Math.min(W - 1, x + r + 1)] - src[o + Math.max(0, x - r)]; } }
    for (let x = 0; x < W; x++) { let s = 0; for (let y = -r; y <= r; y++) s += tmp[Math.min(H - 1, Math.max(0, y)) * W + x]; for (let y = 0; y < H; y++) { out[y * W + x] = s / n; s += tmp[Math.min(H - 1, y + r + 1) * W + x] - tmp[Math.max(0, y - r) * W + x]; } }
    return out;
  }

  class Painter {
    constructor(canvas) { this.c = canvas; this.ctx = canvas.getContext('2d', { willReadFrequently: true }); this.regions = []; this.seeds = []; this.col = {}; this.orig = false; this.ready = false; }
    load(src, cb) {
      const img = new Image(); this.ready = false; this.regions = []; this.seeds = [];
      img.onload = () => {
        const sc = Math.min(1, 1000 / Math.max(img.naturalWidth, img.naturalHeight)), W = Math.round(img.naturalWidth * sc), H = Math.round(img.naturalHeight * sc);
        this.W = W; this.H = H; this.c.width = W; this.c.height = H; this.ctx.drawImage(img, 0, 0, W, H);
        this.src = this.ctx.getImageData(0, 0, W, H); const d = this.src.data, n = W * H;
        this.lab = [new Float32Array(n), new Float32Array(n), new Float32Array(n)];
        for (let i = 0, p = 0; i < n; i++, p += 4) rgb2lab(d[p], d[p + 1], d[p + 2], this.lab, i);
        this.ready = true; cb && cb(true);
      };
      img.onerror = () => cb && cb(false);
      img.src = src;
    }
    // competitive region growing: every seed grows at once, regions meet where the colour changes (corners, edges)
    compute() {
      const { W, H } = this, [L, A, B] = this.lab, n = W * H, sd = this.seeds, owner = new Int16Array(n).fill(-1);
      const NB = 220, bi = Array.from({ length: NB }, () => []), bs = Array.from({ length: NB }, () => []);
      sd.forEach((q, k) => { bi[0].push(q.i); bs[0].push(k); });
      for (let q = 0; q < NB; q++) {
        const I = bi[q], S = bs[q];
        while (I.length) {
          const i = I.pop(), k = S.pop(); if (owner[i] !== -1) continue; owner[i] = k;
          const sk = sd[k], x = i % W, y = (i / W) | 0, lim = sk.tol * 1.05;
          for (let d = 0; d < 4; d++) {
            let m;
            if (d === 0) { if (x === 0) continue; m = i - 1; } else if (d === 1) { if (x === W - 1) continue; m = i + 1; } else if (d === 2) { if (y === 0) continue; m = i - W; } else { if (y === H - 1) continue; m = i + W; }
            if (owner[m] !== -1) continue;
            const el = (L[m] - sk.l) / 1.5, ea = A[m] - sk.a, eb = B[m] - sk.b, dl = L[m] - L[i], da = A[m] - A[i], db = B[m] - B[i];
            const c = Math.sqrt(el * el + ea * ea + eb * eb) + 1.3 * Math.sqrt(dl * dl + da * da + db * db);
            if (c > lim) continue;
            const qq = Math.max(q, Math.min(NB - 1, Math.round(c * 6))); bi[qq].push(m); bs[qq].push(k);
          }
        }
      }
      this.fillHoles(owner);
      this.regions = [];
      sd.forEach((sk, k) => {
        let m = new Float32Array(n), cnt = 0; for (let i = 0; i < n; i++) if (owner[i] === k) { m[i] = 1; cnt++; }
        if (cnt < 40) { this.regions.push({ role: sk.role, idx: new Int32Array(0), al: new Uint8Array(0), ref: 50 }); return; }
        m = boxBlur(m, W, H, 2); for (let i = 0; i < n; i++) m[i] = m[i] > .3 ? 1 : 0; m = boxBlur(m, W, H, 1);
        const idx = [], al = []; let sum = 0, c2 = 0;
        for (let i = 0; i < n; i++) if (m[i] > .02) { idx.push(i); al.push(Math.round(m[i] * 255)); if (m[i] > .9) { sum += L[i]; c2++; } }
        this.regions.push({ role: sk.role, idx: Int32Array.from(idx), al: Uint8Array.from(al), ref: c2 ? sum / c2 : sk.l });
      });
    }
    // small unowned islands (highlights, glare) that are fully surrounded by one region and look like it get absorbed
    fillHoles(owner) {
      const { W, H } = this, [L, A, B] = this.lab, n = W * H, seen = new Uint8Array(n), st = new Int32Array(n), maxA = n * .05;
      for (let s0 = 0; s0 < n; s0++) {
        if (owner[s0] !== -1 || seen[s0]) continue;
        let sp = 0, cnt = 0, edge = false, sl = 0, sa = 0, sb = 0, one = -2; const comp = []; st[sp++] = s0; seen[s0] = 1;
        while (sp) {
          const i = st[--sp]; comp.push(i); cnt++; sl += L[i]; sa += A[i]; sb += B[i]; const x = i % W, y = (i / W) | 0;
          for (let d = 0; d < 4; d++) {
            let m;
            if (d === 0) { if (x === 0) { edge = true; continue; } m = i - 1; } else if (d === 1) { if (x === W - 1) { edge = true; continue; } m = i + 1; } else if (d === 2) { if (y === 0) { edge = true; continue; } m = i - W; } else { if (y === H - 1) { edge = true; continue; } m = i + W; }
            const o = owner[m]; if (o === -1) { if (!seen[m]) { seen[m] = 1; st[sp++] = m; } } else if (one === -2) one = o; else if (one !== o) one = -3;
          }
        }
        if (edge || cnt > maxA || one < 0) continue;
        const q = this.seeds[one]; sl /= cnt; sa /= cnt; sb /= cnt;
        if (Math.abs(sl - q.l) < 14 && Math.hypot(sa - q.a, sb - q.b) < 9) for (const i of comp) owner[i] = one;
      }
    }
    seedAt(role, px, py, tol) {
      const { W, H } = this, [L, A, B] = this.lab; px = Math.max(0, Math.min(W - 1, px | 0)); py = Math.max(0, Math.min(H - 1, py | 0));
      let sl = 0, sa = 0, sb = 0, c = 0;
      for (let y = Math.max(0, py - 2); y <= Math.min(H - 1, py + 2); y++) for (let x = Math.max(0, px - 2); x <= Math.min(W - 1, px + 2); x++) { const i = y * W + x; sl += L[i]; sa += A[i]; sb += B[i]; c++; }
      return { role, i: py * W + px, l: sl / c, a: sa / c, b: sb / c, tol };
    }
    add(role, px, py, tol) {
      if (!this.ready || this.seeds.length > 40) return null;
      this.seeds.push(this.seedAt(role, px, py, tol)); this.compute();
      const r = this.regions[this.regions.length - 1];
      if (!r.idx.length) { this.seeds.pop(); this.compute(); return null; } return r;
    }
    undo() { if (!this.seeds.length) return false; this.seeds.pop(); this.compute(); return true; }
    clearRole(role) { this.seeds = this.seeds.filter(q => q.role !== role); this.compute(); }
    reset() { this.seeds = []; this.regions = []; }
    addMany(list) { for (const q of list) this.seeds.push(this.seedAt(q[0], q[1], q[2], q[3])); this.compute(); }
    render() {
      if (!this.ready) return; const { W, H } = this, out = new ImageData(new Uint8ClampedArray(this.src.data), W, H), o = out.data, [L, A, B] = this.lab;
      if (!this.orig) for (const r of this.regions) {
        const c = this.col[r.role]; if (!c) continue; const t = hexLab(c.h), sc = Math.max(.5, Math.min(1.2, t[0] / Math.max(20, r.ref)));
        for (let k = 0; k < r.idx.length; k++) {
          const i = r.idx[k], m = r.al[k] / 255, p = i * 4;
          const rgb = lab2rgb(Math.max(0, Math.min(100, t[0] + (L[i] - r.ref) * sc)), t[1], t[2]);
          o[p] = o[p] * (1 - m) + rgb[0] * m; o[p + 1] = o[p + 1] * (1 - m) + rgb[1] * m; o[p + 2] = o[p + 2] * (1 - m) + rgb[2] * m;
        }
      }
      this.ctx.putImageData(out, 0, 0);
    }
  }

  // seed points (percent of photo) per scene and role, tolerance
  const SCENES = {
    hall: { name: 'Hall', src: 'images/pv/hall.jpg?v=3', room: 'hall', tol: 11, seeds: [['main', 20, 30], ['main', 35, 25], ['main', 4, 40], ['main', 12, 18], ['accent', 62, 35], ['accent', 80, 20], ['accent', 90, 45], ['accent', 70, 62], ['ceiling', 25, 9], ['ceiling', 75, 9], ['ceiling', 45, 4], ['ceiling', 15, 12], ['ceiling', 88, 6], ['skip', 20, 75, 18], ['skip', 62, 67, 18], ['skip', 70, 40, 18], ['skip', 72, 80, 18], ['skip', 42, 68, 12], ['skip', 52, 64, 12], ['skip', 47, 48, 10]] },
    bedroom: { name: 'Bedroom', src: 'images/pv/bedroom.jpg?v=3', room: 'bedroom', tol: 11, seeds: [['accent', 10, 22], ['accent', 52, 25], ['accent', 4, 35], ['main', 80, 25], ['main', 85, 42], ['main', 62, 30], ['main', 78, 55], ['skip', 30, 52, 16], ['skip', 45, 50, 16], ['skip', 25, 62, 16], ['skip', 50, 70, 28], ['skip', 70, 72, 28], ['skip', 40, 80, 28], ['skip', 60, 82, 28], ['skip', 45, 92, 22], ['skip', 8, 82, 20], ['skip', 9, 48, 15], ['skip', 37, 22, 30], ['skip', 93, 80, 20], ['skip', 58, 60, 15], ['skip', 15, 60, 15], ['skip', 22, 70, 20]] },
    kids: { name: 'Bachon ka kamra', src: 'images/pv/kids.jpg?v=3', room: 'kids', tol: 12, seeds: [['accent', 62, 16, 12], ['accent', 80, 12, 12], ['accent', 88, 40, 12], ['accent', 55, 28, 12], ['accent', 85, 10, 14], ['accent', 72, 22, 13], ['main', 38, 22, 11], ['main', 34, 38, 11], ['main', 30, 62, 14], ['main', 10, 66, 14], ['main', 4, 48, 11], ['ceiling', 35, 4], ['ceiling', 50, 9], ['ceiling', 18, 3], ['skip', 8, 32, 22], ['skip', 20, 26, 22], ['skip', 28, 38, 22], ['skip', 6, 50, 22], ['skip', 70, 56, 22], ['skip', 10, 60, 22], ['skip', 50, 88, 22], ['skip', 43, 62, 22], ['skip', 66, 35, 28], ['skip', 87, 30, 25], ['skip', 22, 70, 28], ['skip', 41, 48, 25], ['skip', 54, 60, 22], ['skip', 24, 38, 30]] },
    kitchen: { name: 'Kitchen (naya kaam)', src: 'images/pv/kitchen.jpg?v=3', room: 'kitchen', tol: 12, seeds: [['main', 50, 38, 11], ['main', 62, 35, 11], ['main', 48, 52, 11], ['main', 72, 48, 11], ['main', 78, 33, 11], ['accent', 8, 50, 12], ['accent', 15, 80, 12], ['accent', 25, 22, 12], ['accent', 3, 25, 12], ['ceiling', 50, 5, 13], ['ceiling', 30, 12, 13], ['ceiling', 70, 9, 13], ['ceiling', 55, 23, 13], ['skip', 22, 58, 30], ['skip', 38, 52, 30], ['skip', 55, 54, 22], ['skip', 55, 66, 30], ['skip', 50, 88, 30], ['skip', 62, 75, 30], ['skip', 92, 35, 40], ['skip', 82, 80, 35]] },
    exterior: { name: 'Bahar ka ghar', src: 'images/pv/exterior.jpg?v=3', room: 'exterior', tol: 20, seeds: [['main', 20, 20], ['main', 50, 15], ['main', 80, 25], ['main', 30, 40], ['main', 10, 70], ['main', 45, 80], ['main', 88, 62], ['main', 60, 35], ['main', 90, 45], ['accent', 57, 62, 18], ['accent', 80, 66, 18], ['accent', 68, 44, 16], ['trim', 30, 82, 14], ['trim', 50, 95, 14], ['skip', 20, 52, 30], ['skip', 20, 45, 22], ['skip', 68, 68, 30], ['skip', 65, 91, 25], ['skip', 68, 52, 18]] },
    upload: { name: 'Apni photo', src: null, room: 'hall', tol: 12, seeds: [] },
  };
  window.PAINT = { Painter, SCENES, hexLab };
})();
