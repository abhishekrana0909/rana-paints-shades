// Simple room / house illustrations. Paintable regions use CSS vars --c-main, --c-accent, --c-ceiling, --c-trim
(function () {
  const shell = (accent) => {
    const wall = k => (accent === k ? 'r-accent' : 'r-main');
    return `
<defs>
 <linearGradient id="gFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98a5e"/><stop offset="1" stop-color="#8d6137"/></linearGradient>
 <linearGradient id="gBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset="1" stop-color="#000" stop-opacity=".10"/></linearGradient>
 <radialGradient id="gVig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient>
 <linearGradient id="gWin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff7de"/><stop offset="1" stop-color="#cfe7f5"/></linearGradient>
</defs>
<path class="r r-ceiling" d="M0 0H800L740 64H60Z"/>
<path class="r ${wall('left')}" d="M0 0L60 64V352L0 430Z"/>
<path class="r ${wall('right')}" d="M800 0L740 64V352L800 430Z"/>
<rect class="r ${wall('back')}" x="60" y="64" width="680" height="288"/>
<path d="M0 430L60 352H740L800 430V500H0Z" fill="url(#gFloor)"/>
<g stroke="#00000018" stroke-width="1.5" fill="none"><path d="M60 352L0 430M740 352L800 430M200 352L150 500M340 352L310 500M480 352L490 500M620 352L650 500M740 352"/></g>
<rect class="r r-trim" x="60" y="64" width="680" height="11"/>
<path class="r r-trim" d="M0 0L60 64V75L0 10Z"/><path class="r r-trim" d="M800 0L740 64V75L800 10Z"/>
<rect class="r r-trim" x="60" y="338" width="680" height="14"/>
<path class="r r-trim" d="M0 416L60 338V352L0 430Z"/><path class="r r-trim" d="M800 416L740 338V352L800 430Z"/>
<rect x="60" y="64" width="680" height="288" fill="url(#gBack)" pointer-events="none"/>
<path d="M0 0L60 64V352L0 430Z" fill="#000" opacity=".13" pointer-events="none"/>
<path d="M800 0L740 64V352L800 430Z" fill="#000" opacity=".06" pointer-events="none"/>
<path d="M0 0H800L740 64H60Z" fill="#000" opacity=".04" pointer-events="none"/>`;
  };
  const vig = '<rect width="800" height="500" fill="url(#gVig)" pointer-events="none"/>';
  const windowLeft = `<g><path d="M10 96L52 124V262L10 300Z" fill="url(#gWin)" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><path d="M31 110V281" stroke="#fff" stroke-width="4"/><path d="M10 198L52 193" stroke="#fff" stroke-width="4"/><path d="M0 80Q14 150 8 310" stroke="#d8c3a0" stroke-width="0"/></g>`;
  const frame = (x, y, w, h) => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f7efe2" stroke="#8a6a46" stroke-width="5"/><circle cx="${x + w * .35}" cy="${y + h * .45}" r="${h * .26}" fill="#d9a65a" opacity=".85"/><path d="M${x + 4} ${y + h - 6}Q${x + w * .4} ${y + h * .45} ${x + w - 4} ${y + h - 10}Z" fill="#7a8f6a" opacity=".9"/></g>`;
  const plant = (x, y) => `<g><path d="M${x - 16} ${y}h32l-5 38h-22z" fill="#a9643f"/><path d="M${x} ${y}C${x - 30} ${y - 30} ${x - 28} ${y - 62} ${x - 4} ${y - 70}C${x - 6} ${y - 40} ${x} ${y - 20} ${x} ${y}Z" fill="#5f8a4e"/><path d="M${x} ${y}C${x + 30} ${y - 26} ${x + 28} ${y - 58} ${x + 6} ${y - 66}C${x + 6} ${y - 40} ${x} ${y - 20} ${x} ${y}Z" fill="#76a15f"/></g>`;
  const lamp = (x, y) => `<g><rect x="${x - 2}" y="${y - 90}" width="4" height="90" fill="#c9a24b"/><path d="M${x - 22} ${y - 90}L${x - 14} ${y - 124}H${x + 14}L${x + 22} ${y - 90}Z" fill="#f4e3bd"/><ellipse cx="${x}" cy="${y}" rx="16" ry="5" fill="#c9a24b"/></g>`;

  const hall = () => `${shell('back')}
<ellipse cx="400" cy="425" rx="250" ry="42" fill="#c8a07a" opacity=".55"/><ellipse cx="400" cy="425" rx="210" ry="32" fill="#e2c7a4" opacity=".6"/>
${frame(330, 112, 150, 96)}
<g><rect x="205" y="238" width="390" height="112" rx="22" fill="#85705d"/><rect x="225" y="205" width="350" height="70" rx="20" fill="#977f69"/><rect x="190" y="262" width="52" height="96" rx="20" fill="#7a6553"/><rect x="558" y="262" width="52" height="96" rx="20" fill="#7a6553"/><rect x="232" y="276" width="336" height="64" rx="14" fill="#a38b74"/><rect x="250" y="226" width="62" height="56" rx="14" fill="#d9b47a" transform="rotate(-6 281 254)"/><rect x="492" y="226" width="62" height="56" rx="14" fill="#a8603f" transform="rotate(6 523 254)"/><rect x="380" y="232" width="56" height="50" rx="14" fill="#efe6d6"/><rect x="215" y="346" width="12" height="16" fill="#4a3526"/><rect x="573" y="346" width="12" height="16" fill="#4a3526"/></g>
<g><rect x="320" y="372" width="160" height="14" rx="4" fill="#6b4a33"/><rect x="332" y="386" width="8" height="22" fill="#4f3624"/><rect x="460" y="386" width="8" height="22" fill="#4f3624"/><ellipse cx="400" cy="372" rx="30" ry="6" fill="#efe6d6"/><rect x="392" y="352" width="16" height="20" rx="4" fill="#5f8a4e"/></g>
${windowLeft}${lamp(676, 372)}${plant(120, 392)}${vig}`;

  const bedroom = () => `${shell('back')}
<ellipse cx="400" cy="420" rx="260" ry="44" fill="#c9a98b" opacity=".5"/>
${frame(330, 100, 140, 82)}
<g><rect x="250" y="168" width="300" height="130" rx="18" fill="#6a4d3b"/><rect x="262" y="180" width="130" height="62" rx="10" fill="#7a5b47"/><rect x="408" y="180" width="130" height="62" rx="10" fill="#7a5b47"/><rect x="232" y="276" width="336" height="92" rx="14" fill="#efe5d7"/><rect x="232" y="318" width="336" height="50" rx="12" fill="#c6926a"/><rect x="262" y="246" width="110" height="44" rx="14" fill="#fbf6ee"/><rect x="428" y="246" width="110" height="44" rx="14" fill="#fbf6ee"/><rect x="232" y="364" width="336" height="14" rx="3" fill="#4f3624"/></g>
<g><rect x="150" y="296" width="60" height="62" rx="5" fill="#7b5a42"/><rect x="590" y="296" width="60" height="62" rx="5" fill="#7b5a42"/><path d="M165 296l8-34h24l8 34z" fill="#f4e3bd"/><path d="M605 296l8-34h24l8 34z" fill="#f4e3bd"/><rect x="178" y="296" width="4" height="0" fill="#c9a24b"/></g>
${windowLeft}${plant(716, 392)}${vig}`;

  const kitchen = () => `${shell('right')}
<g><rect x="110" y="106" width="210" height="104" rx="6" fill="#8f6e52"/><rect x="480" y="106" width="210" height="104" rx="6" fill="#8f6e52"/><path d="M118 112v92M215 112v92M312 112v92M488 112v92M585 112v92M682 112v92" stroke="#00000030" stroke-width="2"/><g fill="#d8b985"><rect x="203" y="154" width="8" height="22" rx="3"/><rect x="219" y="154" width="8" height="22" rx="3"/><rect x="573" y="154" width="8" height="22" rx="3"/><rect x="589" y="154" width="8" height="22" rx="3"/></g></g>
<path d="M340 92H460L440 132H360Z" fill="#b8bcc0"/><rect x="392" y="130" width="16" height="70" fill="#a3a7ab"/>
<g opacity=".95"><rect x="322" y="204" width="156" height="104" fill="#f3efe8"/><path d="M322 230H478M322 256H478M322 282H478M361 204V308M400 204V308M439 204V308" stroke="#d9d2c6" stroke-width="2"/></g>
<g><rect x="100" y="262" width="600" height="90" fill="#8f6e52"/><rect x="92" y="248" width="616" height="16" fill="#ece6dc"/><path d="M200 266v84M300 266v84M400 266v84M500 266v84M600 266v84" stroke="#00000030" stroke-width="2"/><g fill="#d8b985"><rect x="194" y="276" width="12" height="6" rx="2"/><rect x="294" y="276" width="12" height="6" rx="2"/><rect x="494" y="276" width="12" height="6" rx="2"/><rect x="594" y="276" width="12" height="6" rx="2"/></g><rect x="352" y="238" width="96" height="10" rx="3" fill="#2f2f31"/><circle cx="378" cy="238" r="9" fill="none" stroke="#555" stroke-width="3"/><circle cx="422" cy="238" r="9" fill="none" stroke="#555" stroke-width="3"/></g>
<g><rect x="162" y="226" width="14" height="22" rx="3" fill="#c46a43"/><rect x="180" y="220" width="16" height="28" rx="3" fill="#d4a537"/><rect x="620" y="228" width="26" height="20" rx="4" fill="#fff"/></g>
${plant(730, 392)}${vig}`;

  const exterior = () => `
<defs>
 <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc5e8"/><stop offset="1" stop-color="#f6ecd6"/></linearGradient>
 <linearGradient id="gGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fa9c4"/><stop offset="1" stop-color="#3f6684"/></linearGradient>
</defs>
<rect width="800" height="500" fill="url(#gSky)"/>
<circle cx="680" cy="80" r="36" fill="#fff3c4" opacity=".95"/>
<g fill="#fff" opacity=".85"><ellipse cx="160" cy="70" rx="60" ry="16"/><ellipse cx="200" cy="58" rx="40" ry="14"/><ellipse cx="520" cy="110" rx="52" ry="13"/></g>
<rect y="420" width="800" height="80" fill="#9aa06f"/><rect y="452" width="800" height="48" fill="#7d7f7e"/>
<path d="M0 452H800" stroke="#fff" stroke-width="3" stroke-dasharray="26 18" opacity=".6"/>
<g>
 <rect class="r r-main" x="170" y="262" width="460" height="152"/>
 <rect class="r r-accent" x="196" y="140" width="408" height="122"/>
 <rect class="r r-trim" x="182" y="124" width="436" height="18" rx="2"/>
 <rect class="r r-trim" x="164" y="252" width="472" height="14" rx="2"/>
 <rect class="r r-trim" x="164" y="410" width="472" height="10" rx="2"/>
 <rect x="170" y="262" width="460" height="152" fill="#000" opacity=".03" pointer-events="none"/>
 <rect x="196" y="140" width="408" height="122" fill="#000" opacity=".06" pointer-events="none"/>
 <g fill="url(#gGlass)" stroke="#fffdf6" stroke-width="5"><rect x="230" y="168" width="88" height="68"/><rect x="356" y="168" width="88" height="68"/><rect x="482" y="168" width="88" height="68"/></g>
 <rect x="216" y="236" width="368" height="10" fill="#4a4a4c"/><path d="M216 246v14M264 246v14M312 246v14M360 246v14M408 246v14M456 246v14M504 246v14M552 246v14M584 246v14" stroke="#4a4a4c" stroke-width="3"/>
 <g fill="url(#gGlass)" stroke="#fffdf6" stroke-width="5"><rect x="206" y="298" width="96" height="76"/><rect x="498" y="298" width="96" height="76"/></g>
 <g><rect x="346" y="286" width="108" height="128" rx="4" fill="#7b4a2c"/><rect x="356" y="296" width="42" height="108" fill="#8d5a37"/><rect x="402" y="296" width="42" height="108" fill="#8d5a37"/><circle cx="394" cy="356" r="4" fill="#d4a537"/><circle cx="406" cy="356" r="4" fill="#d4a537"/></g>
</g>
<g>
 <rect class="r r-ceiling" x="0" y="372" width="170" height="52"/><rect class="r r-ceiling" x="630" y="372" width="170" height="52"/>
 <rect class="r r-ceiling" x="0" y="364" width="170" height="10"/><rect class="r r-ceiling" x="630" y="364" width="170" height="10"/>
 <path d="M0 372H170M630 372H800" stroke="#00000022" stroke-width="2"/>
 <rect x="0" y="372" width="170" height="52" fill="#000" opacity=".05" pointer-events="none"/><rect x="630" y="372" width="170" height="52" fill="#000" opacity=".05" pointer-events="none"/>
</g>
<g><rect x="300" y="404" width="200" height="16" fill="#cfc9bd" opacity=".0"/></g>
<g><path d="M70 300q-36 -30 -4 -70q20 -34 48 -8q34 4 20 44q-10 26 -34 34z" fill="#5f8a4e"/><rect x="88" y="318" width="10" height="64" fill="#6b4a33"/><path d="M730 330q-28-26 -4-56q22-26 44-4q26 6 14 36q-8 22 -30 28z" fill="#76a15f"/><rect x="748" y="344" width="8" height="40" fill="#6b4a33"/></g>
<g><rect x="316" y="414" width="168" height="8" fill="#b9b1a3"/><path d="M316 422h168l12 30H304z" fill="#a9a396"/></g>`;

  const R4 = [['main', 'Mukhya deewar'], ['accent', 'Accent deewar'], ['ceiling', 'Chhat'], ['trim', 'Patti / Border']];
  window.SCENES = {
    hall: { name: 'Hall', svg: hall, regions: [['main', 'Baaki deewarein'], ['accent', 'Accent (saamne ki)'], ['ceiling', 'Chhat'], ['trim', 'Patti / Border']], room: 'hall' },
    bedroom: { name: 'Bedroom', svg: bedroom, regions: [['main', 'Baaki deewarein'], ['accent', 'Accent (bed ke peeche)'], ['ceiling', 'Chhat'], ['trim', 'Patti / Border']], room: 'bedroom' },
    kitchen: { name: 'Kitchen', svg: kitchen, regions: [['main', 'Mukhya deewar'], ['accent', 'Accent (daayi deewar)'], ['ceiling', 'Chhat'], ['trim', 'Patti / Border']], room: 'kitchen' },
    exterior: { name: 'Bahar ka ghar', svg: exterior, regions: [['main', 'Neeche ki manzil'], ['accent', 'Upar ki manzil'], ['ceiling', 'Boundary deewar'], ['trim', 'Patti / Chhajja']], room: 'exterior' },
  };
  // which combo room shows in which scene
  window.SCENE_FOR_ROOM = { hall: 'hall', bedroom: 'bedroom', kids: 'bedroom', kitchen: 'kitchen', pooja: 'hall', dining: 'hall', exterior: 'exterior', passage: 'hall' };
})();
