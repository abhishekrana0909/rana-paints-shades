(function () {
'use strict';
const D = window.RPS, B = D.brands, FAM = D.fam;
const BN = ['Asian Paints', 'Berger', 'Birla Opus'];
const PPL = [{ n: 'Daler Rana', p: '9417123935' }, { n: 'Manjit Rana', p: '9417888704' }];
const ROOMS = [
  { id: 'hall', n: 'Hall / Drawing Room', s: 'Hall', g: 'linear-gradient(135deg,#C9654A,#8C2B1F)', d: 'Mehmaan ka kamra' },
  { id: 'bedroom', n: 'Master Bedroom', s: 'Bedroom', g: 'linear-gradient(135deg,#7FA1B8,#3E5F7C)', d: 'Aaram aur neend' },
  { id: 'kids', n: 'Bachon ka Kamra', s: 'Bachon ka kamra', g: 'linear-gradient(135deg,#F4C430,#E48A2A)', d: 'Khel aur padhai' },
  { id: 'kitchen', n: 'Kitchen', s: 'Kitchen', g: 'linear-gradient(135deg,#7CC8A4,#2F7D6A)', d: 'Rasoi ghar' },
  { id: 'pooja', n: 'Pooja Room', s: 'Pooja room', g: 'linear-gradient(135deg,#E58E26,#A8561A)', d: 'Mandir wala kona' },
  { id: 'dining', n: 'Dining Area', s: 'Dining', g: 'linear-gradient(135deg,#B3472E,#6E2A1A)', d: 'Khaane ki jagah' },
  { id: 'passage', n: 'Passage / Seedhiyan', s: 'Passage', g: 'linear-gradient(135deg,#9A9A94,#5E5E5A)', d: 'Galiyaare aur staircase' },
  { id: 'exterior', n: 'Bahar ki Deewarein', s: 'Bahar', g: 'linear-gradient(135deg,#D4A537,#7E5A1A)', d: 'Elevation aur boundary' },
  { id: 'other', n: 'Baaki / Alag Jagah', s: 'Alag list', g: 'linear-gradient(135deg,#8E7CC3,#4B3D80)', d: 'Terrace, store, office...' },
];
const RM = Object.fromEntries(ROOMS.map(r => [r.id, r]));
const STY = { flat: 'Modern Flat', kothi: 'Kothi', villa: 'Villa / Luxury', haveli: 'Haveli / Heritage', floor: 'Builder Floor', farm: 'Farmhouse' };
const ROLES = { main: 'Mukhya deewar', accent: 'Accent deewar', ceiling: 'Chhat', trim: 'Patti / Border' };
const ROLES_EXT = { main: 'Neeche ki manzil', accent: 'Upar ki manzil', ceiling: 'Boundary deewar', trim: 'Patti / Chhajja' };

/* ---------- data ---------- */
const SH = D.s.map((a, i) => ({ i, b: a[0], n: a[1], c: a[2], h: '#' + a[3], f: a[4], k: B[a[0]].id + '|' + a[2], nl: a[1].toLowerCase(), cl: a[2].toLowerCase().replace(/\s/g, '') }));
const KEY = new Map(SH.map(s => [s.k, s]));
const lab = h => {
  let [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4));
  let x = (r * .4124 + g * .3576 + b * .1805) / .95047, y = r * .2126 + g * .7152 + b * .0722, z = (r * .0193 + g * .1192 + b * .9505) / 1.08883;
  const f = t => t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; x = f(x); y = f(y); z = f(z);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
};
SH.forEach(s => { s.lab = lab(s.h); s.t = s.lab[0] >= 75 ? 'l' : s.lab[0] >= 50 ? 'm' : 'd'; });
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const textOn = h => { const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); return (r * .299 + g * .587 + b * .114) > 150 ? '#2A1810' : '#fff'; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const nearestIn = (lb, bi, n, skipKey) => {
  const res = []; for (const s of SH) { if (bi != null && s.b !== bi) continue; if (s.k === skipKey) continue; res.push([dist(lb, s.lab), s]); }
  res.sort((a, b) => a[0] - b[0]); return res.slice(0, n);
};
const deTag = d => d < 3 ? '<span class="tt">Bahut close</span>' : d < 7 ? '<span class="tt mid">Close</span>' : '<span class="tt far">Thoda alag</span>';

/* ---------- state ---------- */
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
let S = store.get('rps1', null) || { rooms: {}, active: 'hall', form: { who: 0, work: 'Poora ghar', house: '3BHK Flat' } };
S.rooms = S.rooms || {}; if (!S.form) S.form = { who: 0 };
const save = () => store.set('rps1', S);
const inRoom = (r, k) => (S.rooms[r] || []).includes(k);
const total = () => Object.values(S.rooms).reduce((a, l) => a + l.length, 0);
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2200); }
function addShade(k, room) {
  room = room || S.active; const l = S.rooms[room] = S.rooms[room] || [];
  if (l.includes(k)) { toast('Ye pehle se ' + RM[room].s + ' ki list me hai'); return false; }
  l.push(k); save(); updCount(); return true;
}
function rmShade(room, k) { S.rooms[room] = (S.rooms[room] || []).filter(x => x !== k); if (!S.rooms[room].length) delete S.rooms[room]; save(); updCount(); }
function updCount() { $('#lc').textContent = total(); }
const shadeLabel = s => BN[s.b] + ' – ' + s.n + ' (' + s.c + ')';

/* ---------- common bits ---------- */
function card(s) {
  const has = inRoom(S.active, s.k);
  return `<article class="sh"><div class="sw" style="background:${s.h}" data-a="open" data-i="${s.i}" role="button" tabindex="0" aria-label="${esc(s.n)} ka detail dekho"><span class="tg">${BN[s.b]}</span></div><div class="in"><b>${esc(s.n)}</b><span>Code ${esc(s.c)}</span></div><button class="add${has ? ' in-list' : ''}" data-a="add" data-k="${esc(s.k)}">${has ? '✓ ' + RM[S.active].s + ' me hai' : '+ ' + RM[S.active].s + ' me jodo'}</button></article>`;
}
function refreshAdd() { $$('.add[data-k]').forEach(b => { const has = inRoom(S.active, b.dataset.k); b.classList.toggle('in-list', has); b.textContent = has ? '✓ ' + RM[S.active].s + ' me hai' : '+ ' + RM[S.active].s + ' me jodo'; }); }
function roombar() {
  const el = $('#roombar'); const r = route();
  el.hidden = !['shades', 'ideas', 'finder', 'preview'].includes(r);
  if (el.hidden) return;
  el.innerHTML = '<b>Shade is kamre ke liye jud rahe hain:</b>' + ROOMS.map(x => `<button class="chip${S.active === x.id ? ' on' : ''}" data-a="room" data-r="${x.id}">${x.s}${(S.rooms[x.id] || []).length ? ` <small>${S.rooms[x.id].length}</small>` : ''}</button>`).join('');
}
function head(eyebrow, title, lead) { return `<div class="ph"><div class="w"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${lead ? `<p class="lead" style="margin-top:10px">${lead}</p>` : ''}</div></div>`; }
const waLink = (p, t) => 'https://wa.me/91' + p + (t ? '?text=' + encodeURIComponent(t) : '');
function people(msg) {
  return `<div class="people">${PPL.map(p => `<div class="pe"><h3>${p.n}</h3><p>Rana Paints · ${p.p.replace(/(\d{5})(\d{5})/, '$1 $2')}</p><div class="row"><a class="btn wa sm" target="_blank" rel="noopener" href="${waLink(p.p, msg || 'Namaste, mujhe paint ke baare me baat karni hai.')}">WhatsApp karo</a><a class="btn sm" href="tel:+91${p.p}">Call karo</a></div></div>`).join('')}</div>`;
}

/* ---------- modal ---------- */
function modal(html, cls) { const m = $('#modal'); $('#mbox').innerHTML = '<button class="mx" data-close aria-label="Band karo">×</button>' + html; $('#mbox').className = 'mbox ' + (cls || ''); m.hidden = false; document.body.style.overflow = 'hidden'; $('#mbox').scrollTop = 0; }
function closeModal() { $('#modal').hidden = true; document.body.style.overflow = ''; }
function openShade(i) {
  const s = SH[i], tc = textOn(s.h);
  const sims = [0, 1, 2].map(bi => ({ bi, l: nearestIn(s.lab, bi, 4, s.k) }));
  modal(`<div class="mbig" style="background:${s.h};color:${tc}"><span>${BN[s.b]} · ${FAM[s.f]}</span><h3>${esc(s.n)}</h3><span>Code ${esc(s.c)} · ${s.h}</span></div>
  <div class="mbody">
    <div class="row"><select id="mroom" aria-label="Kamra chuno" class="chip" style="padding:9px 12px">${ROOMS.map(r => `<option value="${r.id}"${r.id === S.active ? ' selected' : ''}>${r.n}</option>`).join('')}</select>
    <button class="btn sm" data-a="madd" data-k="${esc(s.k)}">+ Meri list me jodo</button>
    <button class="btn line sm" data-a="mprev" data-k="${esc(s.k)}">Kamre me dekho</button>
    <button class="btn line sm" data-a="copy" data-t="${esc(BN[s.b] + ' ' + s.n + ' ' + s.c)}">Code copy karo</button></div>
    <div><h4>Kaisa dikhega</h4><div class="row" style="gap:0;border-radius:14px;overflow:hidden;border:1px solid var(--line)"><div style="flex:1;min-width:140px;padding:18px;background:${s.h};color:${tc}"><b style="font-family:var(--hf);font-size:1.15rem">Deewar ka rang</b><br><small>Din ki roshni me</small></div><div style="flex:1;min-width:140px;padding:18px;background:#fff;color:${s.h}"><b style="font-family:var(--hf);font-size:1.15rem">Safed par</b><br><small>Furniture / patti jaisa</small></div><div style="flex:1;min-width:140px;padding:18px;background:#2A1810;color:${s.h}"><b style="font-family:var(--hf);font-size:1.15rem">Raat ki jagmag</b><br><small>Gehre background par</small></div></div></div>
    ${sims.map(x => `<div><h4>${BN[x.bi]}${x.bi === s.b ? ' me aas-paas ke rang' : ' me sabse close'}</h4><div class="similar">${x.l.map(([d, t]) => `<button class="sc" data-a="open" data-i="${t.i}"><i style="background:${t.h}"></i><div><b>${esc(t.n)}</b><small>${esc(t.c)}</small>${x.bi === s.b ? '' : '<br>' + deTag(d)}</div></button>`).join('')}</div></div>`).join('')}
    <p class="note">Screen par rang asli paint se thoda alag dikhta hai. Final shade hamesha physical shade card se confirm karna.</p>
  </div>`);
}
function openPicker(cb, title) {
  let st = { q: '', b: -1 }; openPicker.cb = cb;
  modal(`<div class="mbody" style="padding-top:26px"><h3 style="font-size:1.4rem;color:var(--maroon-d)">${title || 'Rang chuno'}</h3>
  <div class="row"><label class="search"><input id="pq" type="search" placeholder="Naam ya code likho..." aria-label="Shade dhundo"></label></div>
  <div class="tabs" id="pb"><button class="chip on" data-pb="-1">Sab</button>${BN.map((n, i) => `<button class="chip" data-pb="${i}">${n}</button>`).join('')}</div>
  <div class="grid" id="pg" style="grid-template-columns:repeat(auto-fill,minmax(130px,1fr))"></div></div>`);
  const draw = () => {
    const q = st.q.toLowerCase().trim();
    const l = SH.filter(s => (st.b < 0 || s.b === st.b) && (!q || s.nl.includes(q) || s.cl.includes(q.replace(/\s/g, '')))).slice(0, 48);
    $('#pg').innerHTML = l.map(s => `<button class="sh" data-a="pickd" data-i="${s.i}" style="text-align:left"><div class="sw" style="background:${s.h};height:64px"></div><div class="in"><b style="font-size:.8rem">${esc(s.n)}</b><span>${BN[s.b].split(' ')[0]} ${esc(s.c)}</span></div></button>`).join('') || '<div class="empty" style="grid-column:1/-1">Kuch nahi mila</div>';
  };
  draw();
  $('#pq').addEventListener('input', e => { st.q = e.target.value; draw(); });
  $('#pb').addEventListener('click', e => { const b = e.target.closest('[data-pb]'); if (!b) return; st.b = +b.dataset.pb; $$('#pb .chip').forEach(c => c.classList.toggle('on', c === b)); draw(); });
}

/* ---------- pages ---------- */
const P = {};
// HOME
P.home = () => {
  const pet = ['#8C2B1F', '#C4623F', '#D4A537', '#7F9A4C', '#3E6B8F'];
  const feat = D.combos.filter(c => [1, 3, 9, 14, 21, 27].includes(c.id) || false);
  return `<section class="hero"><div class="w"><div><div class="eyebrow">Asian Paints · Berger · Birla Opus</div>
  <h1>Apne ghar ka rang <em>khud chuno</em>, WhatsApp pe bhej do.</h1>
  <p>Hazaaron official shades ek jagah. Kamre ke hisaab se rang chuno, deewar par laga ke dekho, aur apni poori list seedha Rana Paints ko bhejo. Na shade card ka intezaar, na bar-bar dukaan ke chakkar.</p>
  <div class="row"><a class="btn" href="#/shades">Shades dekho</a><a class="btn line" href="#/ideas">Ghar ke ideas</a></div>
  <div class="stats"><div><b>${SH.length.toLocaleString('en-IN')}+</b><span>Official shades</span></div><div><b>3</b><span>Top brands</span></div><div><b>${D.combos.length}</b><span>Ready combinations</span></div></div></div>
  <div class="fan" aria-hidden="true">${pet.map((c, i) => `<i style="background:${c};transform:rotate(${(i - 2) * 24}deg) scaleY(1)"></i>`).join('')}</div></div></section>
  <section class="sec alt"><div class="w"><div class="eyebrow">Kaise kaam karta hai</div><h2 class="h2">4 kadam, bas.</h2>
  <div class="steps"><div class="step"><div class="n">1</div><h3>Kamra chuno</h3><p>Hall, bedroom, kitchen, pooja room ya bahar ki deewar. Har kamre ki apni list banti hai.</p></div>
  <div class="step"><div class="n">2</div><h3>Rang chuno</h3><p>Asian Paints, Berger ya Birla Opus ke shades search karo, ya hamare ready combinations utha lo.</p></div>
  <div class="step"><div class="n">3</div><h3>Preview dekho</h3><p>Rang kamre ki deewar par laga ke dekho, accent aur chhat ke saath, bina ek boond paint ke.</p></div>
  <div class="step"><div class="n">4</div><h3>WhatsApp pe bhejo</h3><p>Naam aur ghar ki detail bharo. Poori list Daler Rana ya Manjit Rana ko seedha chali jaati hai.</p></div></div></div></section>
  <section class="sec"><div class="w"><div class="eyebrow">Kamre ke hisaab se</div><h2 class="h2">Kaunsa kamra rangna hai?</h2><p class="lead">Kamra chuno aur uske ready combinations dekho.</p>
  <div class="tiles">${ROOMS.filter(r => r.id !== 'other').map(r => `<a class="tile" style="--g:${r.g}" href="#/ideas" data-a="gotoroom" data-r="${r.id}"><h3>${r.n}</h3><span>${r.d}</span></a>`).join('')}</div></div></section>
  <section class="sec alt"><div class="w"><div class="eyebrow">Pasandida combinations</div><h2 class="h2">Shahi se modern tak</h2><p class="lead">North India ke ghar ke hisaab se, Asian Paints ke asli shades ke saath. Brand badal ke dusre brand ke close shades bhi dekh sakte ho.</p>
  <div class="cgrid">${feat.map(c => comboCard(c, 0)).join('')}</div><div class="more"><a class="btn" href="#/ideas">Saare ${D.combos.length} combinations dekho</a></div></div></section>
  <section class="sec"><div class="w"><div class="eyebrow">Hamari khaas cheezein</div><h2 class="h2">Sirf shades nahi, poora saath</h2>
  <div class="cards"><div class="card"><h3>Rang Dhundo</h3><p>Apni saree, parde, ya kisi photo ka rang chuno aur dekho teeno brands me sabse close shade kaunsa hai.</p><p style="margin-top:12px"><a class="btn line sm" href="#/finder">Try karo</a></p></div>
  <div class="card"><h3>Kamre me preview</h3><p>Hall, bedroom, kitchen aur bahar ke ghar par rang laga ke dekho, aur picture save karo.</p><p style="margin-top:12px"><a class="btn line sm" href="#/preview">Preview dekho</a></p></div>
  <div class="card"><h3>Rang Gyan</h3><p>Vastu, finish, roshni aur kitni paint lagegi, sab kuch aasaan Hinglish me.</p><p style="margin-top:12px"><a class="btn line sm" href="#/guide">Padho</a></p></div>
  <div class="card"><h3>Poore ghar ka theka</h3><p>Hum sirf rang nahi dikhate, poora ghar paint bhi karte hain. Deewar ki taiyari se safai tak.</p><p style="margin-top:12px"><a class="btn line sm" href="#/service">Hamara kaam</a></p></div></div></div></section>
  <section class="sec alt"><div class="w"><div class="eyebrow">Seedha baat</div><h2 class="h2">Rang chun liya? Hum se baat karo.</h2><p class="lead">Dono me se kisi ko bhi WhatsApp ya call karo.</p>${people()}</div></section>
  <section class="sec"><div class="w faq"><div class="eyebrow">Aksar poochhe jaane wale sawaal</div><h2 class="h2" style="margin-bottom:20px">FAQ</h2>${faq()}</div></section>`;
};
const FAQ = [
  ['Kya yahan ke shades official hain?', 'Shade ke naam aur code Asian Paints, Berger aur Birla Opus ki public colour catalogue se liye gaye hain. Screen par dikhne wala rang (hex) sirf andaza hai, kyunki har screen alag dikhati hai.'],
  ['Screen ka rang aur asli rang alag kyun dikhta hai?', 'Mobile ya laptop ki screen ki brightness aur colour setting alag hoti hai, aur paint dukaan ki tinting machine se bante hain. Isliye final shade hamesha physical shade card ya sample patch se confirm karo.'],
  ['List bhejne ke baad kya hota hai?', 'Daler Rana ya Manjit Rana aapse WhatsApp par baat karenge, shade card ya sample dikhayenge, aur site dekh kar estimate batayenge.'],
  ['Kya koi shade list me na ho to?', 'Aap bas rang ka naam ya code message me likh do, ya kisi photo ka rang Rang Dhundo se pakad lo.'],
  ['Kya ye service free hai?', 'Haan, shades dekhna aur list bhejna bilkul free hai.'],
];
function faq() { return FAQ.map(q => `<details><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join(''); }

// SHADES
const SS = { b: -1, f: -1, t: '', q: '', n: 60 };
P.shades = () => {
  const html = head('Shade library', 'Saare shades, ek jagah', 'Brand, rang ya naam se dhundo. Rang par click karke bada preview aur dusre brand ke close shades dekho.') +
    `<div class="w"><div class="filters" id="flt">
    <div class="fl"><label class="search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="sq" type="search" placeholder="Naam, code ya hex (jaise Fire Globe, 7950)" value="${esc(SS.q)}" aria-label="Shade dhundo"></label></div>
    <div class="fl"><b>Brand</b><button class="chip" data-a="sb" data-v="-1">Sab</button>${BN.map((n, i) => `<button class="chip" data-a="sb" data-v="${i}">${n}</button>`).join('')}</div>
    <div class="fl"><b>Rang</b><button class="chip" data-a="sf" data-v="-1">Sab</button>${FAM.map((n, i) => `<button class="chip" data-a="sf" data-v="${i}"><i class="dot" style="background:${FAMC[i]}"></i>${n}</button>`).join('')}</div>
    <div class="fl"><b>Shade</b><button class="chip" data-a="st" data-v="">Sab</button><button class="chip" data-a="st" data-v="l">Halka</button><button class="chip" data-a="st" data-v="m">Medium</button><button class="chip" data-a="st" data-v="d">Gehra</button></div></div>
    <div class="cnt" id="cnt"></div><div class="grid" id="sg"></div><div class="more" id="mre"></div></div>`;
  setTimeout(() => { shadeFilterUI(); drawShades(); $('#sq').addEventListener('input', e => { SS.q = e.target.value; SS.n = 60; drawShades(); }); }, 0);
  return html;
};
const FAMC = ['#F4F2EE', '#E8D9B8', '#F2C94C', '#E9822B', '#C73A2F', '#EFA3B8', '#8E6BB8', '#3E7CB1', '#4C9A5B', '#8A5A3A', '#8D9094'];
function shadeFilterUI() { $$('#flt [data-a=sb]').forEach(b => b.classList.toggle('on', +b.dataset.v === SS.b)); $$('#flt [data-a=sf]').forEach(b => b.classList.toggle('on', +b.dataset.v === SS.f)); $$('#flt [data-a=st]').forEach(b => b.classList.toggle('on', b.dataset.v === SS.t)); }
function filtered() {
  const q = SS.q.toLowerCase().trim(), qc = q.replace(/\s/g, '').replace('#', '');
  return SH.filter(s => (SS.b < 0 || s.b === SS.b) && (SS.f < 0 || s.f === SS.f) && (!SS.t || s.t === SS.t) && (!q || s.nl.includes(q) || s.cl.includes(qc) || s.h.toLowerCase() === '#' + qc));
}
function drawShades() {
  const l = filtered(), g = $('#sg'); if (!g) return;
  $('#cnt').textContent = l.length.toLocaleString('en-IN') + ' shades mile';
  g.innerHTML = l.slice(0, SS.n).map(card).join('') || '<div class="empty" style="grid-column:1/-1">Is search me koi shade nahi mila. Filter badal ke dekho.</div>';
  const m = $('#mre'); m.innerHTML = l.length > SS.n ? '<button class="btn line" data-a="more" id="morebtn">Aur shades dikhao</button>' : '';
  if (l.length > SS.n && 'IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); SS.n += 60; drawShades(); } }, { rootMargin: '600px' }); const mb = $('#morebtn'); if (mb) io.observe(mb); }
}

// IDEAS
const IS = { room: 'all', style: 'all', brand: 0 };
function roleLabels(room) { return room === 'exterior' ? ROLES_EXT : ROLES; }
function comboCard(c, bi) {
  const rl = roleLabels(c.room), shs = ['main', 'accent', 'ceiling', 'trim'].map(r => ({ r, s: SH[c.m[r][bi]] }));
  const [m, a, ce, tr] = shs;
  return `<article class="cb"><div class="pal"><i style="background:${m.s.h};color:${textOn(m.s.h)}"><small>${rl.main}</small></i><i style="background:${a.s.h};color:${textOn(a.s.h)}"><small>${rl.accent}</small></i><div style="display:grid;grid-template-columns:1fr 1fr"><i style="background:${ce.s.h};color:${textOn(ce.s.h)}"></i><i style="background:${tr.s.h};color:${textOn(tr.s.h)}"></i></div></div>
  <div class="bd"><h3>${esc(c.title)}</h3><div class="tags"><span>${RM[c.room].s}</span><span>${STY[c.style]}</span><span>${c.mood}</span></div><p>${esc(c.tip)}</p>
  <div class="cs">${shs.map(x => `<div><i style="background:${x.s.h}"></i><b>${esc(x.s.n)}</b><small>${rl[x.r]} · ${esc(x.s.c)}</small></div>`).join('')}</div>
  <div class="ac"><button class="btn sm" data-a="cadd" data-id="${c.id}" data-bi="${bi}">+ Poora combo list me</button><button class="btn line sm" data-a="cprev" data-id="${c.id}" data-bi="${bi}">Preview</button></div></div></article>`;
}
P.ideas = () => {
  setTimeout(drawIdeas, 0);
  return head('Ghar ke ideas', 'North India ke ghar, ready combinations', 'Har combination me 4 rang hain: mukhya deewar, accent, chhat aur patti. Brand chuno aur dekho us brand ke asli shades kaunse hain.') +
    `<div class="w"><div class="filters" id="iflt"><div class="fl"><b>Kamra</b><button class="chip" data-a="ir" data-v="all">Sab</button>${ROOMS.filter(r => r.id !== 'other').map(r => `<button class="chip" data-a="ir" data-v="${r.id}">${r.s}</button>`).join('')}</div>
    <div class="fl"><b>Ghar</b><button class="chip" data-a="is" data-v="all">Sab</button>${Object.entries(STY).map(([k, v]) => `<button class="chip" data-a="is" data-v="${k}">${v}</button>`).join('')}</div>
    <div class="fl"><b>Brand</b>${BN.map((n, i) => `<button class="chip" data-a="ib" data-v="${i}">${n}</button>`).join('')}</div></div><div class="cnt" id="icnt"></div><div class="cgrid" id="cg"></div></div>`;
};
function drawIdeas() {
  const g = $('#cg'); if (!g) return;
  $$('#iflt [data-a=ir]').forEach(b => b.classList.toggle('on', b.dataset.v === IS.room)); $$('#iflt [data-a=is]').forEach(b => b.classList.toggle('on', b.dataset.v === IS.style)); $$('#iflt [data-a=ib]').forEach(b => b.classList.toggle('on', +b.dataset.v === IS.brand));
  const l = D.combos.filter(c => (IS.room === 'all' || c.room === IS.room) && (IS.style === 'all' || c.style === IS.style));
  $('#icnt').textContent = l.length + ' combinations · ' + BN[IS.brand] + ' ke shades';
  g.innerHTML = l.map(c => comboCard(c, IS.brand)).join('') || '<div class="empty" style="grid-column:1/-1">Is mel ka koi combination nahi mila. Ghar ka type ya kamra badal ke dekho.</div>';
}

// PREVIEW
const PV = { scene: 'hall', reg: 'main', col: null, brand: 0 };
function pvDefault(sc) {
  const room = SCENES[sc].room, c = D.combos.find(x => x.room === room) || D.combos[0];
  PV.col = {}; for (const r of ['main', 'accent', 'ceiling', 'trim']) PV.col[r] = { h: '#' + c.c[r], k: null };
}
function pvApplyCombo(c, bi) { PV.col = {}; for (const r of ['main', 'accent', 'ceiling', 'trim']) { const s = SH[c.m[r][bi]]; PV.col[r] = { h: s.h, k: s.k }; } PV.brand = bi; }
P.preview = () => {
  if (!PV.col) pvDefault(PV.scene);
  setTimeout(drawPreview, 0);
  return head('Kamre me preview', 'Rang laga ke dekho', 'Neeche ki picture par kisi deewar par click karo, phir rang chuno. Jo achha lage use apni list me save karo.') +
    `<div class="w"><div class="tabs" id="scn" style="margin-bottom:14px">${Object.entries(SCENES).map(([k, v]) => `<button class="chip" data-a="scene" data-v="${k}">${v.name}</button>`).join('')}</div><div class="pv"><div class="scene" id="scn-box"></div><div class="pnl" id="pnl"></div></div></div>`;
};
function drawPreview() {
  const box = $('#scn-box'); if (!box) return; const sc = SCENES[PV.scene];
  $$('#scn .chip').forEach(b => b.classList.toggle('on', b.dataset.v === PV.scene));
  box.innerHTML = `<svg viewBox="0 0 800 500" id="svgp" role="img" aria-label="${sc.name} ka preview">${sc.svg()}</svg>`;
  paintSvg();
  const combos = D.combos.filter(c => SCENE_FOR_ROOM[c.room] === PV.scene);
  $('#pnl').innerHTML = `<div><h3>Kahan rang lagana hai?</h3><div class="regs">${sc.regions.map(([k, n]) => `<button class="reg${PV.reg === k ? ' on' : ''}" data-a="reg" data-v="${k}"><i style="background:${PV.col[k].h}"></i><div><b>${n}</b><span>${PV.col[k].k ? esc(shadeLabel(KEY.get(PV.col[k].k))) : 'Sample rang'}</span></div></button>`).join('')}</div></div>
  <div><h3>Rang chuno</h3><div class="row" style="margin:8px 0"><button class="btn sm" data-a="pvpick">Shade dhundo</button><button class="btn line sm" data-a="pvlist">Meri list se</button></div><div class="mini" id="pmini">${miniList()}</div></div>
  <div><h3>Ready combo lagao</h3><div class="row" style="margin-top:8px"><select id="pcs" class="chip" style="max-width:100%;padding:9px 10px">${combos.map(c => `<option value="${c.id}">${esc(c.title)}</option>`).join('')}</select><select id="pbs" class="chip" style="padding:9px 10px">${BN.map((n, i) => `<option value="${i}"${i === PV.brand ? ' selected' : ''}>${n}</option>`).join('')}</select><button class="btn gold sm" data-a="pvcombo">Lagao</button></div></div>
  <div class="row"><button class="btn wa sm" data-a="pvsave">Ye shades list me save karo</button><button class="btn line sm" data-a="pvdl">Picture save karo</button></div>
  <p class="note">Ye sirf andaza hai. Roshni aur furniture ke hisaab se asli rang thoda alag dikh sakta hai.</p>`;
}
function paintSvg() { const s = $('#svgp'); if (!s) return; for (const r in PV.col) s.style.setProperty('--c-' + r, PV.col[r].h); $$('#svgp .r').forEach(n => { const role = [...n.classList].find(c => c.startsWith('r-')).slice(2); n.classList.toggle('sel', role === PV.reg); n.dataset.role = role; }); }
function miniList() { const keys = [...new Set(Object.values(S.rooms).flat())].slice(0, 20); return keys.length ? keys.map(k => { const s = KEY.get(k); return s ? `<button style="background:${s.h}" data-a="pvuse" data-k="${esc(k)}" title="${esc(shadeLabel(s))}" aria-label="${esc(s.n)} lagao"></button>` : ''; }).join('') : '<span class="note" style="width:100%">Abhi list khaali hai. "Shade dhundo" se rang chuno.</span>'; }
function pvSet(s) { PV.col[PV.reg] = { h: s.h, k: s.k }; drawPreview(); }
function pvPng() {
  const src = $('#svgp').cloneNode(true); src.removeAttribute('style'); src.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); src.setAttribute('width', 1600); src.setAttribute('height', 1000);
  $$('.r', src).forEach(n => { const role = n.dataset.role; n.setAttribute('fill', PV.col[role].h); n.removeAttribute('class'); n.removeAttribute('style'); });
  const w = document.createElementNS('http://www.w3.org/2000/svg', 'text'); w.setAttribute('x', 14); w.setAttribute('y', 488); w.setAttribute('font-size', 18); w.setAttribute('font-family', 'sans-serif'); w.setAttribute('fill', '#fff'); w.setAttribute('stroke', '#00000066'); w.setAttribute('stroke-width', .6); w.textContent = 'Rana Paints Shades'; src.appendChild(w);
  const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); c.width = 1600; c.height = 1000; c.getContext('2d').drawImage(img, 0, 0, 1600, 1000); c.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'rana-paints-preview.png'; a.click(); }); };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(src));
}

// FINDER
const FD = { h: '#C4623F' };
P.finder = () => {
  setTimeout(() => { drawFind(); }, 0);
  return head('Rang dhundo', 'Koi bhi rang, teeno brands me', 'Apni saree, parde, cushion ya kisi photo ka rang pakdo. Hum bata denge Asian Paints, Berger aur Birla Opus me sabse close shade kaunsa hai.') +
    `<div class="w"><div class="fd"><div class="drop"><b style="font-family:var(--hf);font-size:1.2rem;color:var(--maroon-d)">Photo se rang pakdo</b><p class="lead" style="font-size:.9rem">Photo chuno, phir uske kisi hisse par click karo.</p><input type="file" id="ff" accept="image/*" aria-label="Photo chuno"><canvas id="fc" aria-label="Photo, rang chunne ke liye click karo"></canvas></div>
    <div><div class="picked"><i id="pk"></i><div><b id="pkn" style="font-family:var(--hf);font-size:1.1rem">Pasandida rang</b><div class="hexin" style="margin-top:6px"><input type="color" id="fcol" aria-label="Rang chuno"><input type="text" id="fhex" maxlength="7" aria-label="Hex code" placeholder="#C4623F"></div></div></div><div id="fres"></div></div></div></div>`;
};
function drawFind() {
  const hx = FD.h; $('#pk').style.background = hx; $('#fcol').value = hx; $('#fhex').value = hx.toUpperCase(); $('#pkn').textContent = hx.toUpperCase();
  const lb = lab(hx); $('#fres').innerHTML = [0, 1, 2].map(bi => `<div class="bgrp"><h4>${BN[bi]}</h4><div class="similar">${nearestIn(lb, bi, 6).map(([d, t]) => `<button class="sc" data-a="open" data-i="${t.i}"><i style="background:${t.h}"></i><div><b>${esc(t.n)}</b><small>${esc(t.c)}</small><br>${deTag(d)}</div></button>`).join('')}</div></div>`).join('');
}
function bindFinder() {
  $('#fcol').addEventListener('input', e => { FD.h = e.target.value; drawFind(); });
  $('#fhex').addEventListener('change', e => { let v = e.target.value.trim(); if (!v.startsWith('#')) v = '#' + v; if (/^#[0-9a-f]{6}$/i.test(v)) { FD.h = v; drawFind(); } else toast('Sahi hex code likho, jaise #C4623F'); });
  $('#ff').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return; const img = new Image();
    img.onload = () => { const c = $('#fc'), mw = Math.min(560, c.parentElement.clientWidth - 36), sc = Math.min(1, mw / img.width); c.width = img.width * sc; c.height = img.height * sc; c.style.display = 'block'; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); };
    img.src = URL.createObjectURL(f);
  });
  $('#fc').addEventListener('click', e => {
    const c = e.target, r = c.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) * c.width / r.width), y = Math.floor((e.clientY - r.top) * c.height / r.height);
    const d = c.getContext('2d').getImageData(Math.max(0, x - 2), Math.max(0, y - 2), 5, 5).data; let R = 0, G = 0, Bb = 0, n = d.length / 4;
    for (let i = 0; i < d.length; i += 4) { R += d[i]; G += d[i + 1]; Bb += d[i + 2]; }
    FD.h = '#' + [R / n, G / n, Bb / n].map(v => Math.round(v).toString(16).padStart(2, '0')).join(''); drawFind();
  });
}

// GUIDE
P.guide = () => head('Rang gyan', 'Rang chunne se pehle ye jaan lo', 'Seedhi aur kaam ki baatein. Vastu, finish, roshni aur kitni paint lagegi.') + `
<div class="w"><div class="cards">
 <div class="card"><h3>60-30-10 ka niyam</h3><p>Kamre me 60% mukhya rang (deewarein), 30% doosra rang (furniture, parde) aur 10% accent (cushion, ek deewar, showpiece). Isse kamra santulit lagta hai.</p></div>
 <div class="card"><h3>Chhota kamra, bada dikhe</h3><ul><li>Halke rang chuno: cream, pastel, off-white</li><li>Chhat sabse halki rakho</li><li>Ek accent deewar gehri ho sakti hai</li></ul></div>
 <div class="card"><h3>Roshni ka khel</h3><ul><li>Uttar disha ki roshni thandi hoti hai, garam rang chuno</li><li>Dakshin ya pashchim ki roshni tez hoti hai, halke thande rang chalte hain</li><li>Rang ko subah, dopahar aur shaam teeno time dekho</li></ul></div>
 <div class="card"><h3>Patch test zaroor</h3><p>Pasand aaye shade ka chhota sample deewar par lagwa kar 1-2 din dekho. Screen aur shade card dono se asli paint thoda alag dikh sakta hai.</p></div>
</div>
<div class="sec" style="padding-bottom:20px"><div class="eyebrow">Vastu ki maanyata</div><h2 class="h2">Disha ke hisaab se rang</h2><p class="lead" style="margin-bottom:18px">Ye paramparik Vastu ki maanyatayein hain. Aap apni pasand aur ghar ki banawat ko bhi dhyan me rakho.</p>
<table class="tbl"><thead><tr><th>Jagah</th><th>Maanya rang</th><th>Kyun</th></tr></thead><tbody>
<tr><td>Pooja room</td><td>Safed, halka peela, cream</td><td>Shanti aur pavitrata ki bhavna</td></tr>
<tr><td>Hall / Drawing</td><td>Cream, halka peela, halka hara</td><td>Swagat karne wala, khula mahaul</td></tr>
<tr><td>Master bedroom</td><td>Halka neela, gulabi, halka hara</td><td>Shanti aur achhi neend</td></tr>
<tr><td>Bachon ka kamra</td><td>Halka hara, aasmaani, peela</td><td>Taazgi aur padhai me man</td></tr>
<tr><td>Kitchen</td><td>Peela, narangi, halka laal</td><td>Garmi aur bhookh badhane wale rang</td></tr>
<tr><td>Dining</td><td>Halka peela, narangi, cream</td><td>Khushnuma mahaul</td></tr>
<tr><td>Bahar ki deewar</td><td>Cream, halka peela, halka bhura</td><td>Saaf aur sweekar karne wali pehli chhaap</td></tr></tbody></table></div>
<div class="sec" style="padding-top:30px"><div class="eyebrow">Finish chunna</div><h2 class="h2">Matt, Sheen ya Gloss?</h2><div class="cards">
 <div class="card"><h3>Matt</h3><p>Chamak nahi, deewar ki khamiyan chhupati hai. Bedroom aur hall ke liye sabse aam pasand.</p></div>
 <div class="card"><h3>Soft Sheen / Satin</h3><p>Halki chamak, saaf karna aasaan. Kitchen, bachon ka kamra aur passage ke liye achha.</p></div>
 <div class="card"><h3>Gloss</h3><p>Zyada chamakdaar aur pakka. Darwaze, grill aur lakdi ke kaam ke liye.</p></div>
 <div class="card"><h3>Texture</h3><p>Ek deewar par texture lagwane se feature wall ban jaati hai. Pehle sample dekh lo.</p></div></div></div>
<div class="sec" style="padding-top:20px"><div class="eyebrow">Andaza lagao</div><h2 class="h2">Kitni paint lagegi?</h2><p class="lead" style="margin-bottom:16px">Ye sirf mota andaza hai. Asli maap site visit par hoti hai.</p>
<div class="calc"><label>Carpet area (sq ft)<input type="number" id="ca" value="1200" min="100" step="50"></label><label>Kya kya rangna hai<select id="cw"><option value="2.5">Sirf deewarein</option><option value="3.5" selected>Deewarein + chhat</option></select></label><label>Coat ki sankhya<select id="cc"><option>1</option><option selected>2</option><option>3</option></select></label><label>Kitna faila ek litre (sq ft)<select id="cv"><option value="110">Mota (110)</option><option value="130" selected>Aam (130)</option><option value="150">Premium (150)</option></select></label><div class="res" id="cr"></div></div></div>
<div class="faq" style="padding-bottom:30px"><h2 class="h2" style="margin-bottom:16px">Aur kuch poochna hai?</h2>${faq()}</div></div>`;
function calc() { const a = +$('#ca').value || 0, m = +$('#cw').value, c = +$('#cc').value, v = +$('#cv').value, ar = a * m, l = ar * c / v; $('#cr').innerHTML = `Rangne ka kshetra lagbhag <b>${Math.round(ar).toLocaleString('en-IN')} sq ft</b>. Paint lagbhag <b>${Math.round(l * .9)} se ${Math.ceil(l * 1.1)} litre</b> lag sakti hai. Primer aur putty alag se.`; }

// SERVICE
P.service = () => head('Hamara kaam', 'Poore ghar ka paint theka', 'Hum sirf rang dikhate nahi, poora ghar rangte bhi hain. Aap rang chuno, baaki sab hum sambhalenge.') + `
<div class="w"><div class="steps">
<div class="step"><div class="n">1</div><h3>Shade chuno</h3><p>Is website par rang chuno aur list WhatsApp karo.</p></div>
<div class="step"><div class="n">2</div><h3>Site dekhna</h3><p>Hum ghar aakar deewarein dekhte hain aur kaam ka estimate batate hain.</p></div>
<div class="step"><div class="n">3</div><h3>Deewar ki taiyari</h3><p>Purani paint ki safai, daraar bharna, putty aur primer.</p></div>
<div class="step"><div class="n">4</div><h3>Paint ka kaam</h3><p>Chune hue shades me poore ghar ki paint, har coat dhyan se.</p></div>
<div class="step"><div class="n">5</div><h3>Safai aur hand-over</h3><p>Kaam ke baad jagah saaf karke ghar aapko saunp dete hain.</p></div></div>
<div class="sec" style="padding-bottom:20px"><div class="eyebrow">Hum kya karte hain</div><h2 class="h2">Hamari services</h2><div class="cards">
<div class="card"><h3>Poora ghar</h3><p>Andar aur bahar, deewarein, chhat aur patti. Ek hi team ek hi jagah.</p></div>
<div class="card"><h3>Sirf andar ka kaam</h3><p>Hall, bedrooms, kitchen aur pooja room. Festival se pehle ghar chamkane ke liye.</p></div>
<div class="card"><h3>Bahar ki deewarein</h3><p>Elevation, boundary aur gate. Mausam se bachne wale shades ki salaah.</p></div>
<div class="card"><h3>Lakdi aur grill</h3><p>Darwaze, khidkiyan aur grill ki polish ya enamel paint.</p></div></div></div>
<div class="sec" style="padding-top:20px"><div class="eyebrow">Seedha baat</div><h2 class="h2">Hum se sampark karo</h2><p class="lead">Dono me se kisi ko bhi WhatsApp ya call karo. Aap apni shade list bhi bhej sakte ho.</p>${people()}<p style="margin-top:22px"><a class="btn" href="#/list">Meri list bhejo</a></p></div></div>`;

// LIST
function buildMsg() {
  const f = S.form, ppl = PPL[f.who || 0]; let m = 'Namaste ' + ppl.n.split(' ')[0] + ' ji! 🙏\nMaine *Rana Paints Shades* website se ye shades chune hain:\n\n';
  const info = [['Naam', f.name], ['Shehar / Ilaka', f.city], ['Ghar', f.house], ['Kaam', f.work], ['Phone', f.phone]].filter(x => x[1]);
  if (info.length) m += info.map(x => `*${x[0]}:* ${x[1]}`).join('\n') + '\n\n';
  for (const r of ROOMS) { const l = (S.rooms[r.id] || []).map(k => KEY.get(k)).filter(Boolean); if (!l.length) continue; m += `*${r.n.toUpperCase()}*\n` + l.map((s, i) => `${i + 1}. ${BN[s.b]} – ${s.n} (${s.c}) ${s.h.toUpperCase()}`).join('\n') + '\n\n'; }
  if (f.notes) m += `*Note:* ${f.notes}\n\n`;
  return m + 'Kripya shade card / estimate ke liye sampark karein. Dhanyavaad!';
}
P.list = () => {
  const has = total() > 0, f = S.form;
  const left = has ? ROOMS.filter(r => (S.rooms[r.id] || []).length).map(r => `<div class="rm"><h3>${r.n}<small>${S.rooms[r.id].length} shades</small></h3>${S.rooms[r.id].map(k => { const s = KEY.get(k); return s ? `<div class="li"><i style="background:${s.h};cursor:pointer" data-a="open" data-i="${s.i}"></i><div><b>${esc(s.n)}</b><span>${BN[s.b]} · ${esc(s.c)}</span></div><button data-a="rm" data-r="${r.id}" data-k="${esc(k)}" aria-label="${esc(s.n)} hatao">×</button></div>` : ''; }).join('')}<div class="row" style="margin-top:10px"><button class="btn line sm" data-a="room" data-r="${r.id}" data-go="shades">+ Aur shades jodo</button><button class="btn line sm" data-a="lprev" data-r="${r.id}">Preview</button></div></div>`).join('') :
    `<div class="empty"><h3 style="font-size:1.4rem;color:var(--maroon-d);margin-bottom:8px">Abhi list khaali hai</h3><p style="margin-bottom:16px">Shades chuno ya koi ready combination uthao.</p><div class="row" style="justify-content:center"><a class="btn" href="#/shades">Shades dekho</a><a class="btn line" href="#/ideas">Ideas dekho</a></div></div>`;
  return head('Meri list', 'Chune hue shades', 'Neeche apni jaankari bharo aur WhatsApp pe bhej do.') + `<div class="w"><div class="lst"><div>${left}</div>
  <form class="fm" id="fm" autocomplete="on"><h3 style="font-size:1.25rem;color:var(--maroon-d)">Aapki jaankari</h3>
  <label>Aapka naam<input name="name" value="${esc(f.name || '')}" autocomplete="name"></label>
  <div class="two"><label>Shehar / Ilaka<input name="city" value="${esc(f.city || '')}"></label><label>Phone (optional)<input name="phone" inputmode="tel" value="${esc(f.phone || '')}" autocomplete="tel"></label></div>
  <div class="two"><label>Ghar ka type<select name="house">${['1BHK Flat', '2BHK Flat', '3BHK Flat', '4BHK / Bada Flat', 'Builder Floor', 'Kothi / Villa', 'Haveli / Purana Ghar', 'Farmhouse', 'Dukaan / Office'].map(x => `<option${x === f.house ? ' selected' : ''}>${x}</option>`).join('')}</select></label>
  <label>Kaam<select name="work">${['Poora ghar', 'Sirf andar ka', 'Sirf bahar ka', 'Kuch kamre'].map(x => `<option${x === f.work ? ' selected' : ''}>${x}</option>`).join('')}</select></label></div>
  <label>Koi aur baat (optional)<textarea name="notes" rows="2" placeholder="Jaise: texture wali deewar chahiye">${esc(f.notes || '')}</textarea></label>
  <div><div style="font-size:.8rem;color:var(--muted);margin-bottom:6px">Kisko bhejna hai?</div><div class="who">${PPL.map((p, i) => `<label><input type="radio" name="who" value="${i}"${(f.who || 0) === i ? ' checked' : ''}>${p.n}</label>`).join('')}</div></div>
  <div class="msgp" id="msgp"></div>
  <button type="button" class="btn wa" data-a="send"${has ? '' : ' disabled'}>WhatsApp pe bhejo</button>
  <div class="row"><button type="button" class="btn line sm" data-a="copymsg">Message copy karo</button><button type="button" class="btn line sm" data-a="clear"${has ? '' : ' disabled'}>List saaf karo</button></div></form></div></div>`;
};
function bindList() {
  const fm = $('#fm'); if (!fm) return;
  const upd = () => { const d = new FormData(fm); ['name', 'city', 'phone', 'house', 'work', 'notes'].forEach(k => S.form[k] = d.get(k)); S.form.who = +d.get('who'); save(); $('#msgp').textContent = buildMsg(); };
  fm.addEventListener('input', upd); fm.addEventListener('change', upd); upd();
}

/* ---------- footer ---------- */
function footer() {
  $('#ft').innerHTML = `<div class="w"><div><h4>Rana Paints Shades</h4><p>Asian Paints, Berger aur Birla Opus ke shades ek jagah. Rana Paints ki taraf se, ghar ke paint theke ke saath.</p></div>
  <div><h4>Jao</h4><a href="#/shades">Shades</a><a href="#/ideas">Ghar Ideas</a><a href="#/preview">Preview</a><a href="#/finder">Rang Dhundo</a><a href="#/guide">Rang Gyan</a><a href="#/service">Hamara Kaam</a></div>
  <div><h4>Sampark</h4>${PPL.map(p => `<a href="tel:+91${p.p}">${p.n}: ${p.p}</a>`).join('')}${PPL.map(p => `<a target="_blank" rel="noopener" href="${waLink(p.p)}">WhatsApp ${p.n.split(' ')[0]}</a>`).join('')}</div>
  <p class="fine">Asian Paints, Berger Paints aur Birla Opus unke apne maalikon ke trademark hain. Ye ek swatantra guide hai, jo Rana Paints ne apne grahkon ke liye banayi hai. Shade ke naam aur code unki public colour catalogue se hain. Screen par dikhne wala rang sirf andaza hai, final shade hamesha physical shade card se confirm karein.</p></div>`;
}

/* ---------- router ---------- */
const TITLES = { home: 'Rana Paints Shades – shades chuno aur WhatsApp karo', shades: 'Shades – Asian Paints, Berger, Birla Opus | Rana Paints Shades', ideas: 'Ghar ke rang combinations | Rana Paints Shades', preview: 'Kamre me rang preview | Rana Paints Shades', finder: 'Rang dhundo | Rana Paints Shades', guide: 'Rang gyan | Rana Paints Shades', service: 'Hamara kaam – poore ghar ka paint theka | Rana Paints Shades', list: 'Meri list | Rana Paints Shades' };
function route() { const r = (location.hash.replace(/^#\/?/, '').split(/[?/]/)[0]) || 'home'; return P[r] ? r : 'home'; }
function render() {
  const r = route(); $('#app').innerHTML = P[r](); document.title = TITLES[r]; footer(); roombar();
  $$('#nav a').forEach(a => a.classList.toggle('on', a.dataset.r === r)); $('#nav').classList.remove('open'); $('#burger').setAttribute('aria-expanded', 'false');
  if (r === 'finder') setTimeout(bindFinder, 0); if (r === 'list') bindList(); if (r === 'guide') { ['ca', 'cw', 'cc', 'cv'].forEach(id => $('#' + id).addEventListener('input', calc)); calc(); }
  if (!render.first) { render.first = 1; } else window.scrollTo(0, 0);
  updCount();
}
function go(h) { if (location.hash === h) render(); else location.hash = h; }

/* ---------- events ---------- */
const H = {
  open: t => openShade(+t.dataset.i),
  add: t => { const k = t.dataset.k; if (addShade(k)) { t.classList.add('in-list'); t.textContent = '✓ ' + RM[S.active].s + ' me hai'; toast(RM[S.active].s + ' me jud gaya'); roombar(); } },
  madd: t => { const room = $('#mroom').value; S.active = room; save(); if (addShade(t.dataset.k, room)) { toast(RM[room].s + ' me jud gaya'); roombar(); refreshAdd(); } },
  mprev: t => { const s = KEY.get(t.dataset.k); closeModal(); const sc = Object.keys(SCENES).includes(PV.scene) ? PV.scene : 'hall'; if (!PV.col) pvDefault(sc); PV.col.main = { h: s.h, k: s.k }; PV.reg = 'main'; go('#/preview'); if (route() === 'preview') drawPreview(); },
  copy: t => { navigator.clipboard && navigator.clipboard.writeText(t.dataset.t).then(() => toast('Copy ho gaya'), () => toast('Copy nahi hua')); },
  room: t => { S.active = t.dataset.r; save(); roombar(); refreshAdd(); if (t.dataset.go) go('#/' + t.dataset.go); },
  gotoroom: t => { IS.room = t.dataset.r; IS.style = 'all'; },
  sb: t => { SS.b = +t.dataset.v; SS.n = 60; shadeFilterUI(); drawShades(); },
  sf: t => { SS.f = +t.dataset.v; SS.n = 60; shadeFilterUI(); drawShades(); },
  st: t => { SS.t = t.dataset.v; SS.n = 60; shadeFilterUI(); drawShades(); },
  more: () => { SS.n += 60; drawShades(); },
  ir: t => { IS.room = t.dataset.v; drawIdeas(); }, is: t => { IS.style = t.dataset.v; drawIdeas(); }, ib: t => { IS.brand = +t.dataset.v; drawIdeas(); },
  cadd: t => { const c = D.combos.find(x => x.id === +t.dataset.id), bi = +t.dataset.bi; let n = 0; ['main', 'accent', 'ceiling', 'trim'].forEach(r => { if (addShade(SH[c.m[r][bi]].k, c.room)) n++; }); S.active = c.room; save(); roombar(); toast(n ? RM[c.room].s + ' me ' + n + ' shades jude' : 'Ye combo pehle se list me hai'); },
  cprev: t => { const c = D.combos.find(x => x.id === +t.dataset.id); PV.scene = SCENE_FOR_ROOM[c.room]; pvApplyCombo(c, +t.dataset.bi); PV.reg = 'main'; go('#/preview'); },
  scene: t => { PV.scene = t.dataset.v; PV.reg = 'main'; pvDefault(PV.scene); drawPreview(); },
  reg: t => { PV.reg = t.dataset.v; drawPreview(); },
  pvpick: () => openPicker(s => pvSet(s), 'Is hisse ke liye rang chuno'),
  pickd: t => { const s = SH[+t.dataset.i]; closeModal(); pvSet(s); },
  pvuse: t => pvSet(KEY.get(t.dataset.k)),
  pvlist: () => { const keys = [...new Set(Object.values(S.rooms).flat())]; if (!keys.length) { toast('Pehle list me kuch shades jodo'); } else $('#pmini').scrollIntoView({ block: 'center', behavior: 'smooth' }); },
  pvcombo: () => { const c = D.combos.find(x => x.id === +$('#pcs').value); if (c) { pvApplyCombo(c, +$('#pbs').value); drawPreview(); } },
  pvsave: () => { const room = SCENES[PV.scene].room; let n = 0; for (const r in PV.col) if (PV.col[r].k && addShade(PV.col[r].k, room)) n++; S.active = room; save(); roombar(); toast(n ? RM[room].s + ' me ' + n + ' shades save hue' : 'Koi naya shade nahi tha (sample rang list me nahi jaate)'); },
  pvdl: () => pvPng(),
  lprev: t => { const l = (S.rooms[t.dataset.r] || []).map(k => KEY.get(k)).filter(Boolean); PV.scene = SCENE_FOR_ROOM[t.dataset.r] || 'hall'; pvDefault(PV.scene); ['main', 'accent', 'ceiling', 'trim'].forEach((r, i) => { if (l[i]) PV.col[r] = { h: l[i].h, k: l[i].k }; }); go('#/preview'); },
  rm: t => { rmShade(t.dataset.r, t.dataset.k); render(); },
  send: () => { const m = buildMsg(), p = PPL[S.form.who || 0].p, u = waLink(p, m); if (u.length > 7000) toast('List bahut lambi hai, message copy karke WhatsApp me paste karo'); window.open(u, '_blank', 'noopener'); },
  copymsg: () => { navigator.clipboard && navigator.clipboard.writeText(buildMsg()).then(() => toast('Message copy ho gaya'), () => toast('Copy nahi hua')); },
  clear: () => { if (confirm('Poori list saaf kar dein?')) { S.rooms = {}; save(); render(); } },
  fab: () => modal(`<div class="mbody" style="padding-top:34px"><h3 style="font-size:1.6rem;color:var(--maroon-d)">Hum se baat karo</h3><p class="lead">Dono me se kisi ko bhi WhatsApp ya call karo.</p>${people()}${total() ? `<p style="margin-top:6px"><a class="btn" href="#/list" data-close>Meri list (${total()}) bhejo</a></p>` : ''}</div>`),
};
document.addEventListener('click', e => {
  if (e.target.closest('[data-close]')) { closeModal(); return; }
  const t = e.target.closest('[data-a]'); if (!t) return; const f = H[t.dataset.a]; if (f) { if (!(t.tagName === 'A' && t.dataset.a === 'gotoroom')) e.preventDefault && t.tagName !== 'A' && e.preventDefault(); f(t, e); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.sw[data-a=open]')) { e.preventDefault(); openShade(+e.target.dataset.i); } });
document.addEventListener('click', e => { const r = e.target.closest && e.target.closest('#svgp .r'); if (r && r.dataset.role) { PV.reg = r.dataset.role; drawPreview(); } });
$('#wafab').addEventListener('click', () => H.fab());
$('#burger').addEventListener('click', () => { const o = $('#nav').classList.toggle('open'); $('#burger').setAttribute('aria-expanded', o); });
window.addEventListener('hashchange', render);
// fan animation
window.addEventListener('load', () => { });
render();
})();
