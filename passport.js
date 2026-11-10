/* MS Scooter — Scooter Passport (booklet)
   Frame: port of the 21st.dev "Shine Border Security Card" (shadcnspace) — laser-scan border.
   Page 1 = identity page. The identity is NEVER in clear in data.js: it is encrypted inside MS_REP (same code as the repair tracking) and decrypted here, in the browser, with the owner's code.
   Page 2 = visa page with ink stamps (purchase, warranty, repairs, vehicle, ownership).
   Needs data.js (MS_DATA, MS_REP, MS_SITE). Brand logos: brand-<name>.webp.   Use: MSPassport.render(el, 'SERIAL', {page:1}) */
(function () {
  var CSS = '\
.msp{--c:#fff;--c2:#f4f4f5;--bd:#e4e4e7;--ink:#09090b;--mut:#71717a;--ok:#0d9488;--okb:#14b8a61a;--bad:#dc2626;--badb:#dc26261a;--warn:#d97706;--warnb:#f59e0b1f;--nfo:#2563eb;--nfob:#3b82f61a;font-family:Cairo,system-ui,-apple-system,Segoe UI,sans-serif;color:var(--ink);max-width:470px;margin:0 auto;line-height:1.45}\
.msp.dark{--c:#111114;--c2:#1b1b20;--bd:#27272a;--ink:#fafafa;--mut:#a1a1aa;--ok:#2dd4bf;--okb:#2dd4bf18;--bad:#f87171;--badb:#f8717120;--warn:#fbbf24;--warnb:#fbbf2420;--nfo:#60a5fa;--nfob:#60a5fa1c}\
.msp *{box-sizing:border-box}\
.msp-shine{position:relative;border-radius:22px;overflow:hidden;border:1px solid var(--bd);padding:2px;background:var(--c)}\
.msp-scan{position:absolute;inset:0;pointer-events:none;background:linear-gradient(to bottom,#3b82f6,#ef4444,#2dd4bf);opacity:.9;filter:blur(4px);-webkit-mask-image:linear-gradient(to bottom,transparent 0%,#000 15%,#000 25%,transparent 40%);mask-image:linear-gradient(to bottom,transparent 0%,#000 15%,#000 25%,transparent 40%);-webkit-mask-size:100% 300%;mask-size:100% 300%;animation:msp-scan 3s linear infinite}\
.msp.bad .msp-scan{background:linear-gradient(to bottom,#ef4444,#f97316,#ef4444);animation-duration:1.6s}.msp.warn .msp-scan{background:linear-gradient(to bottom,#f59e0b,#fde047,#f59e0b)}\
@keyframes msp-scan{0%{-webkit-mask-position:0% -100%;mask-position:0% -100%}100%{-webkit-mask-position:0% 200%;mask-position:0% 200%}}\
.msp-in{position:relative;z-index:1;border-radius:20px;background:var(--c);padding:18px 16px;display:grid;gap:14px}\
.msp-top{display:flex;align-items:center;justify-content:space-between;gap:10px}\
.msp-id{display:flex;align-items:center;gap:12px;min-width:0}\
.msp-ic{width:42px;height:42px;border-radius:13px;background:var(--nfob);display:grid;place-items:center;color:var(--nfo);flex:none}.msp-ic svg{width:22px;height:22px}\
.msp-top b{display:block;font-size:15px;font-weight:800}.msp-top small{display:block;font-size:12px;color:var(--mut)}\
.msp-bdg{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:99px;font-size:12px;font-weight:800;border:1px solid transparent;white-space:nowrap}.msp-bdg i{width:7px;height:7px;border-radius:50%;background:currentColor;animation:msp-pulse 1.6s infinite}@keyframes msp-pulse{50%{opacity:.25}}\
.msp-bdg.ok{color:var(--ok);background:var(--okb);border-color:var(--ok)}.msp-bdg.bad{color:var(--bad);background:var(--badb);border-color:var(--bad)}.msp-bdg.warn{color:var(--warn);background:var(--warnb);border-color:var(--warn)}\
.msp-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;background:var(--c2);padding:4px;border-radius:13px}\
.msp-tabs button{border:0;background:transparent;color:var(--mut);font:inherit;font-weight:800;font-size:13px;padding:8px 6px;border-radius:10px;cursor:pointer}.msp-tabs button.on{background:var(--c);color:var(--ink);box-shadow:0 1px 4px #0002}\
.msp-book{display:grid;perspective:1500px}\
.msp-pg{grid-area:1/1;display:flex;transform-origin:left center;transition:transform .6s cubic-bezier(.3,.7,.2,1),opacity .45s;backface-visibility:hidden}\
[dir=rtl] .msp-pg{transform-origin:right center}\
.msp-pg.off{opacity:0;pointer-events:none;transform:rotateY(-80deg)}[dir=rtl] .msp-pg.off{transform:rotateY(80deg)}\
.msp-pg>.msp-pp{flex:1}.msp-pp{--p:#f6efdd;position:relative;border-radius:14px;padding:16px 14px 14px;background:var(--p);color:#1f2937;border:1px solid #d9cfb4;overflow:hidden;box-shadow:inset 0 0 40px #b4975a22,0 6px 18px -10px #0006;min-height:520px}\
.msp-pp:before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.5;background:repeating-radial-gradient(circle at 20% 110%,transparent 0 9px,#8b5e3c14 9px 10px),repeating-radial-gradient(circle at 85% -10%,transparent 0 11px,#1d4ed814 11px 12px)}\
.msp-pp>*{position:relative}\
.msp-ph{display:flex;justify-content:space-between;align-items:baseline;gap:8px;border-bottom:2px solid #1f293722;padding-bottom:7px;margin-bottom:12px}.msp-ph b{font-size:14px;font-weight:900;letter-spacing:.06em;text-transform:uppercase}.msp-ph small{font-size:11px;color:#6b5b3e;font-weight:700}\
.msp-i1{display:grid;grid-template-columns:118px 1fr;gap:12px;align-items:start}\
.msp-photo{position:relative;border-radius:10px;border:1.5px solid #1f293733;overflow:hidden;aspect-ratio:3/4;background:#e5e7eb}.msp-photo.m{background:linear-gradient(#dbeafe,#bfdbfe)}.msp-photo.f{background:linear-gradient(#fce7f3,#fbcfe8)}\
.msp-photo svg{width:100%;height:100%;display:block}.msp-photo .sx{position:absolute;inset-inline-end:6px;inset-block-end:6px;width:26px;height:26px;border-radius:50%;background:#1f2937;color:#fff;display:grid;place-items:center;font-weight:900;font-size:13px}\
.msp-photo .lk{position:absolute;inset:0;display:grid;place-items:center;background:#f6efddcc;backdrop-filter:blur(3px)}.msp-photo .lk svg{width:34px;height:34px;color:#1f2937}\
.msp-fl{display:grid;gap:7px;min-width:0}\
.msp-f small{display:block;font-size:10px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#7c6a46}.msp-f b{display:block;font-size:14.5px;font-weight:800;min-height:20px;overflow-wrap:anywhere}.msp-f b.lkd{color:#9ca3af;letter-spacing:.2em}\
.msp-f2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}\
.msp-f2 .msp-f{padding:7px 9px;border-radius:8px;background:#ffffff66;border:1px solid #1f293714}\
.msp-ul{margin-top:12px;padding:11px;border-radius:12px;border:1.5px dashed #b4975a;background:#fffaf0}.msp-ul b{display:flex;align-items:center;gap:6px;font-size:13px}.msp-ul p{margin:3px 0 8px;font-size:12px;color:#6b5b3e}\
.msp-ul form{display:flex;gap:6px}.msp-ul input{flex:1;min-width:0;border:1px solid #cdbf9a;background:#fff;color:#111;border-radius:9px;padding:9px 11px;font:700 15px ui-monospace,Menlo,Consolas,monospace;letter-spacing:.12em;text-transform:uppercase;direction:ltr;text-align:center}\
.msp-ul button{border:0;border-radius:9px;padding:0 15px;background:#1f2937;color:#fff;font:inherit;font-weight:800;font-size:13px;cursor:pointer}.msp-ul .er{color:#b91c1c;font-size:12px;font-weight:800;margin-top:5px}\
.msp-mrz{margin-top:14px;padding:8px 6px;border-top:1px dashed #1f293733;font:700 11.2px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.02em;direction:ltr;text-align:left;color:#374151;word-break:break-all;opacity:.85}\
.msp-visa .msp-ph b{color:#1d4ed8}\
.msp-st{display:grid;grid-template-columns:1fr 1fr;gap:6px 4px;align-items:center;justify-items:center;padding:4px 0 6px}\
.pst{position:relative;mix-blend-mode:multiply;filter:url(#msp-ink);transform:rotate(var(--r,0deg));opacity:.9;max-width:100%}\
.pst.w2{grid-column:1/-1}\
.pst svg{display:block;width:100%;height:auto}\
.pst-r{border:3px double var(--k);color:var(--k);padding:8px 12px;text-align:center;font-weight:900;border-radius:6px;background:transparent;width:100%}\
.pst-r.dash{border:2px dashed var(--k)}.pst-r.oval{border-radius:50%/42%;padding:14px 16px}\
.pst-r small{display:block;font-size:10px;letter-spacing:.14em;text-transform:uppercase;font-weight:800;opacity:.9}.pst-r strong{display:block;font-size:19px;line-height:1.15;margin:3px 0}.pst-r em{display:block;font-style:normal;font-size:11.5px;font-weight:800}\
.pst-r .row{display:flex;justify-content:space-between;gap:8px;font-size:12px;font-weight:800;text-align:start;border-top:1px dotted var(--k);padding:3px 0}.pst-r .row span:last-child{direction:ltr;unicode-bidi:isolate;text-align:end}\
.pst-big{border:4px solid var(--k);color:var(--k);padding:5px 14px;font-weight:900;letter-spacing:.12em;font-size:22px;text-transform:uppercase;border-radius:8px;text-align:center}\
.pst-logo{width:110px;height:110px;border:3px solid var(--k);border-radius:14px;display:grid;place-items:center;padding:10px;color:var(--k)}.pst-logo img{max-width:100%;max-height:100%;filter:grayscale(1) contrast(1.4);display:block}.pst-logo span{font-size:46px;font-weight:900}\
.msp-vn{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:2px solid #1f293722;padding-top:9px;margin-top:6px;font:800 12px ui-monospace,Menlo,Consolas,monospace;color:#374151;direction:ltr}\
.msp-bc{height:26px;flex:1;max-width:180px;opacity:.75}\
.msp-v{display:flex;align-items:center;gap:10px;border-radius:12px;border:1px solid;padding:12px 14px;font-weight:800;font-size:14px}.msp-v svg{width:20px;height:20px;flex:none}\
.msp-v.ok{color:var(--ok);border-color:var(--ok);background:var(--okb)}.msp-v.bad{color:var(--bad);border-color:var(--bad);background:var(--badb)}.msp-v.warn{color:var(--warn);border-color:var(--warn);background:var(--warnb)}\
.msp-ft{margin:0;font-size:11.5px;color:var(--mut);text-align:center}\
.msp-nf{padding:30px 10px;text-align:center}.msp-nf b{display:block;font-size:17px;margin-bottom:6px}.msp-nf p{margin:0;color:var(--mut);font-size:13.5px}\
@media(max-width:400px){.msp-i1{grid-template-columns:96px 1fr}.msp-in{padding:14px 10px}}\
@media print{.msp-scan{display:none}.msp-pg.off{display:none}}@media(prefers-reduced-motion:reduce){.msp-scan,.msp-bdg i{animation:none}.msp-pg{transition:none}}';

  CSS += '.msp-dots{color:#9ca3af;letter-spacing:.12em}.msp-f b bdi{unicode-bidi:isolate}' +
    '.msp-photo .lkb{position:absolute;inset-inline-start:6px;inset-block-end:6px;width:26px;height:26px;border-radius:50%;background:#1f2937;color:#fff;display:grid;place-items:center}.msp-photo .lkb svg{width:14px;height:14px}' +
    '.msp-rc{margin-top:12px;padding:11px;border-radius:12px;border:1.5px solid #b4975a;background:#fffaf0}.msp-rc .rt{display:flex;gap:10px;align-items:center}.msp-rc .ri{width:36px;height:36px;border-radius:10px;background:#1f2937;color:#fff;display:grid;place-items:center;flex:none}.msp-rc .ri svg{width:19px;height:19px}.msp-rc b{display:block;font-size:13.5px}.msp-rc small{display:block;font-size:11.5px;color:#6b5b3e}.msp-rc .rb{display:flex;gap:6px;margin-top:9px;flex-wrap:wrap}.msp-rc button{flex:1 1 90px;border:0;border-radius:9px;padding:9px 8px;background:#dc2626;color:#fff;font:inherit;font-weight:800;font-size:12.5px;cursor:pointer}.msp-rc button.alt{background:#1f2937}' +
    '.msp-rv{position:fixed;inset:0;z-index:100000;background:#000a;display:grid;place-items:center;padding:12px;font-family:Cairo,system-ui,sans-serif}.msp-rvb{width:100%;max-width:600px;max-height:100%;display:flex;flex-direction:column;background:#fff;color:#09090b;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px #0008}.msp-rv.dark .msp-rvb{background:#111114;color:#fafafa}' +
    '.msp-rvh{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #e4e4e7}.msp-rv.dark .msp-rvh,.msp-rv.dark .msp-rvf{border-color:#27272a}.msp-rvh b{font-size:15px;font-weight:800}.msp-rvh .x{border:0;background:transparent;color:inherit;font-size:20px;cursor:pointer;width:34px;height:34px;border-radius:9px}' +
    '.msp-rvs{overflow:auto;padding:12px;background:#e5e7eb;flex:1}.msp-rv.dark .msp-rvs{background:#09090b}.msp-sheet{width:100%;max-width:560px;margin:0 auto;aspect-ratio:595.5/842.25;background:#fff;box-shadow:0 2px 12px #0004;direction:ltr;unicode-bidi:isolate}.msp-sheet svg{direction:ltr}.msp-rvl{margin:0;padding:40px 10px;text-align:center;color:#555;font-weight:700;font-size:14px}' +
    '.msp-rvf{display:flex;gap:8px;padding:12px 14px;border-top:1px solid #e4e4e7}.msp-rvf button{flex:1;border:0;border-radius:11px;padding:11px 8px;font:inherit;font-weight:800;font-size:13.5px;cursor:pointer;background:#dc2626;color:#fff}.msp-rvf button.alt{background:#1f2937}';

  CSS += '.msp-stp{list-style:none;margin:0 0 10px;padding:0;display:grid;gap:5px;counter-reset:s}.msp-stp li{counter-increment:s;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:#6b5b3e}.msp-stp li:before{content:counter(s);flex:none;width:20px;height:20px;border-radius:50%;background:#d9cfb4;color:#1f2937;display:grid;place-items:center;font-size:11px;font-weight:900}.msp-stp li.on{color:#1f2937;font-weight:900}.msp-stp li.on:before{background:#1f2937;color:#fff}.msp-stp li.dn:before{content:"✓";background:#15803d;color:#fff}' +
    '.msp-fpb:not(.hold):not(.done){animation:msp-pl 1.6s ease-out infinite}@keyframes msp-pl{0%{box-shadow:0 0 0 0 #38bdf8aa}100%{box-shadow:0 0 0 18px #38bdf800}}.msp-hand{display:block;font-size:26px;margin-top:6px;animation:msp-hd 1.2s ease-in-out infinite}@keyframes msp-hd{50%{transform:translateY(-6px)}}.msp-fpb.hold~.msp-hand,.msp-fpb.done~.msp-hand{display:none}' +
    '.msp-ul input::placeholder{letter-spacing:0;text-transform:none;font-family:Cairo,system-ui,sans-serif;font-weight:700;font-size:13px}.msp-f2 .msp-f b{font-size:13.5px}' +
    '.msp-fpd{margin-top:12px;padding:14px 11px 12px;border-radius:12px;border:1.5px solid #b4975a;background:#fffaf0;text-align:center}.msp-fpd b{display:block;font-size:13.5px}.msp-fpd p{margin:3px 0 10px;font-size:12px;color:#6b5b3e}' +
    '.msp-fpb{position:relative;width:104px;height:104px;margin:0 auto;border:0;padding:0;border-radius:50%;background:#1f2937;color:#e5e7eb;cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;outline-offset:4px}' +
    '.msp-fpb svg.ic{position:absolute;inset:22px;width:60px;height:60px;color:#9ca3af;transition:color .25s}.msp-fpb.hold svg.ic{color:#38bdf8}.msp-fpb.done svg.ic{color:#34d399}' +
    '.msp-fpb svg.rg{position:absolute;inset:-6px;width:116px;height:116px;transform:rotate(-90deg);pointer-events:none}.msp-fpb svg.rg circle{fill:none;stroke-width:5;stroke-linecap:round}.msp-fpb svg.rg .t{stroke:#d9cfb4}.msp-fpb svg.rg .f{stroke:#38bdf8;stroke-dasharray:339.3;stroke-dashoffset:339.3;transition:stroke-dashoffset .25s}.msp-fpb.hold svg.rg .f{stroke-dashoffset:0;transition:stroke-dashoffset 1.15s linear}.msp-fpb.done svg.rg .f{stroke:#34d399;stroke-dashoffset:0;transition:stroke .2s}' +
    '.msp-fpb .sl{position:absolute;inset-inline:20px;height:3px;border-radius:3px;background:#38bdf8;box-shadow:0 0 10px 2px #38bdf8;top:20px;opacity:0;pointer-events:none}.msp-fpb.hold .sl{opacity:1;animation:msp-fps .7s ease-in-out infinite alternate}@keyframes msp-fps{to{top:80px}}' +
    '.msp-fpb.done{animation:msp-fpd .5s ease-out}@keyframes msp-fpd{40%{transform:scale(1.08)}}' +
    '.msp-fpd .st{margin-top:10px;font-size:12.5px;font-weight:800;color:#6b5b3e;min-height:18px}.msp-fpd .st.ok{color:#15803d}' +
    '.msp-rt3{display:grid;gap:12px}.msp-rt3 .hd{display:flex;gap:10px;align-items:center}.msp-rt3 .hd .ri{width:36px;height:36px;border-radius:10px;background:#1f2937;color:#fff;display:grid;place-items:center;flex:none}.msp-rt3 .hd .ri svg{width:19px;height:19px}.msp-rt3 .hd b{display:block;font-size:13.5px}.msp-rt3 .hd small{display:block;font-size:11.5px;color:#6b5b3e}' +
    '.msp-rt3 .sheet{width:100%;aspect-ratio:595.5/842.25;background:#fff;border:1px solid #d9cfb4;box-shadow:0 2px 12px #0003;direction:ltr;unicode-bidi:isolate}.msp-rt3 .sheet svg{direction:ltr;display:block;width:100%;height:100%}.msp-rt3 .sheet .msp-rvl{margin:0;padding:40px 10px;text-align:center;color:#555;font-weight:700;font-size:14px}' +
    '.msp-rt3 .rb{display:flex;gap:6px}.msp-rt3 button{flex:1;border:0;border-radius:10px;padding:11px 8px;background:#dc2626;color:#fff;font:inherit;font-weight:800;font-size:13px;cursor:pointer}.msp-rt3 button.alt{background:#1f2937}.msp-rt3 button:disabled{opacity:.5;cursor:wait}' +
    '.msp-rtl{text-align:center;padding:30px 6px}.msp-rtl .lk{width:46px;height:46px;margin:0 auto 10px;border-radius:50%;background:#1f2937;color:#fff;display:grid;place-items:center}.msp-rtl .lk svg{width:22px;height:22px}.msp-rtl b{display:block;font-size:14px}.msp-rtl p{margin:4px 0 12px;font-size:12px;color:#6b5b3e}.msp-rtl button{border:0;border-radius:10px;padding:10px 18px;background:#1f2937;color:#fff;font:inherit;font-weight:800;font-size:13px;cursor:pointer}' +
    '@media(prefers-reduced-motion:reduce){.msp-fpb.hold .sl{animation:none}.msp-fpb.done{animation:none}}@media print{.msp-fpd{display:none}}';

  var SV = {
    fp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/></svg>',
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>',
    bad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    man: '<svg viewBox="0 0 90 120"><path d="M6 120c0-25 15-37 39-37s39 12 39 37z" fill="#1f2937"/><rect x="38" y="64" width="14" height="22" rx="6" fill="#e3b08a"/><path d="M33 83l12 15 12-15-6-3-6 6-6-6z" fill="#f3f4f6"/><path d="M45 98l-4-8h8z" fill="#b91c1c"/><path d="M45 97l-3.5 23h7z" fill="#b91c1c"/><ellipse cx="28" cy="49" rx="3.2" ry="5.5" fill="#e3b08a"/><ellipse cx="62" cy="49" rx="3.2" ry="5.5" fill="#e3b08a"/><ellipse cx="45" cy="46" rx="17" ry="21" fill="#f2cba8"/><path d="M27.5 45c-3-21 8-31 17.5-31s21 9 17.5 31c-1.5-8-5-13-9-15-8 3-18 2-23 6-1.500 2.500-2.500 5.500-3 9z" fill="#2b1d14"/><path d="M33 40q4-3 9-1M48 39q5-2 9 1" stroke="#2b1d14" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="38" cy="47" r="1.9" fill="#1f2937"/><circle cx="52" cy="47" r="1.9" fill="#1f2937"/><path d="M45 48v6" stroke="#d29a76" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M39.500 58.500q5.500 3.500 11 0" stroke="#9a5b3c" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>',
    wom: '<svg viewBox="0 0 90 120"><path d="M20 88c-8-30 0-62 25-62s33 32 25 62z" fill="#0f172a"/><circle cx="45" cy="46" r="18" fill="#9d174d"/><path d="M10 120c0-27 15-38 35-38s35 11 35 38z" fill="#9d174d"/><path d="M27 42c2-12 10-17 19-17s16 5 18 16c-6-6-12-8-19-8s-12 3-18 9z" fill="#0f172a"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
    neu: '<svg viewBox="0 0 90 120"><circle cx="45" cy="44" r="19" fill="#6b7280"/><path d="M10 120c0-27 15-40 35-40s35 13 35 40z" fill="#6b7280"/></svg>'
  };

  var T = {
    ar: { s1: 'اكتب رقم وثيقة الهوية الكامل', s2: 'اضغط «فتح»', s3: 'ضع إصبعك على البصمة', fph: 'اضغط مطولاً بالفأرة أو بإصبعك', t: 'جواز السكوتر', sub: 'MS Scooter · السجل الرسمي', sec: 'موثّق', alert: 'تنبيه', chk: 'قيد التحقق', p1: 'الهوية', p2: 'التأشيرة', p1t: 'صفحة الهوية', p2t: 'تأشيرة السكوتر', sn: 'اللقب', gn: 'الاسم', sx: 'الجنس', sxm: 'ذكر', sxf: 'أنثى', bd: 'تاريخ الميلاد', pob: 'مكان الميلاد', wil: 'الولاية', idn: 'رقم وثيقة الهوية', iss: 'تاريخ الإصدار', pno: 'رقم الجواز', lkT: 'الهوية محمية', lkP: 'أدخل رقم وثيقة الهوية الكامل لفتح الجواز كاملاً ونسخة الوصل.', p3: 'الوصل', p3t: 'نسخة الوصل', fpT: 'ضع إصبعك على البصمة', fpH: 'اضغط مطولاً على البصمة حتى تكتمل الدائرة', fpS: 'جارٍ المسح…', fpOk: 'تم التحقق من الهوية', idph: 'رقم وثيقة الهوية الكامل', rcl: 'الوصل مرتبط بالهوية', rcg: 'افتح الهوية أولاً بإدخال رقم وثيقة الهوية الكامل.', rco: 'فتح الهوية', rpdf: 'تحميل PDF', rimg: 'تحميل صورة', rpe: 'تعذّر إنشاء الملف، حاول مرة أخرى.',  un: 'فتح', bad: 'رمز غير صحيح', noid: 'لم تُسجَّل هوية المالك بعد.', nocr: 'تعذّر الفك : يلزم HTTPS.', own: 'المالك', loading: 'جارٍ الفتح…', rct: 'نسخة الوصل', rcs: 'نسخة من وصل الشراء الخاص بك', rcv: 'عرض الوصل', rcd: 'تحميل صورة', rcpr: 'PDF / طباعة', rce: 'تعذّر عرض الوصل، حاول لاحقاً.', cls: 'إغلاق',
      sold: 'تم البيع', warr: 'الضمان', mo: 'أشهر', mo2: 'شهراً', act: 'ساري', exp: 'منتهي', left: 'يوم', svc: 'الورشة', none: 'لا إصلاحات', rep: 'تدخل', now: 'قيد الإصلاح', veh: 'المركبة', brand: 'الماركة', model: 'الطراز', color: 'اللون', ser: 'الرقم التسلسلي', km: 'المسافة', orig: 'المالك الأصلي', tr: 'انتقلت الملكية', stolen: 'مسروق', disp: 'قيد التحقق', ext: 'مسجّل', visa: 'تأشيرة رقم',
      ok: 'جواز أصلي : السكوتر مسجّل لدى MS Scooter', vstolen: 'مُبلَّغ عنه كمسروق : لا تشتريه واتصل بنا', vdisp: 'الملكية قيد التحقق : انتبه قبل الشراء', nf: 'لم نجد هذا الرقم التسلسلي', nfp: 'تحقق من الرقم المكتوب على الوصل أو على الهيكل ثم أعد المحاولة.', priv: 'الهوية مشفّرة ولا تظهر إلا برمز المالك.', loc: 'ar-DZ-u-nu-latn' },
    fr: { s1: 'Saisissez le n° complet', s2: 'Appuyez sur « Ouvrir »', s3: 'Posez le doigt sur l’empreinte', fph: 'Maintenez avec la souris ou le doigt', t: 'Passeport du scooter', sub: 'MS Scooter · Registre officiel', sec: 'Authentique', alert: 'ALERTE', chk: 'À vérifier', p1: 'Identité', p2: 'Visa', p1t: 'Page d’identité', p2t: 'Visa du scooter', sn: 'Nom', gn: 'Prénom(s)', sx: 'Sexe', sxm: 'Masculin', sxf: 'Féminin', bd: 'Date de naissance', pob: 'Lieu de naissance', wil: 'Wilaya', idn: 'N° pièce d’identité', iss: 'Date d’émission', pno: 'N° de passeport', lkT: 'Identité protégée', lkP: 'Saisissez le n° complet de votre pièce d’identité pour ouvrir le passeport complet et la copie du reçu.', p3: 'Reçu', p3t: 'Copie du reçu', fpT: 'Posez votre doigt sur l’empreinte', fpH: 'Maintenez appuyé jusqu’à ce que le cercle soit complet', fpS: 'Lecture…', fpOk: 'Identité vérifiée', idph: 'N° complet de la pièce d’identité', rcl: 'Le reçu est lié à l’identité', rcg: 'Ouvrez d’abord l’identité avec le n° complet de la pièce d’identité.', rco: 'Ouvrir l’identité', rpdf: 'Télécharger le PDF', rimg: 'Télécharger l’image', rpe: 'Impossible de créer le fichier, réessayez.',  un: 'Ouvrir', bad: 'Code incorrect', noid: 'Identité du propriétaire non enregistrée.', nocr: 'Déchiffrement impossible : HTTPS requis.', own: 'Propriétaire', loading: 'Ouverture…', rct: 'Copie du reçu', rcs: 'Copie de votre reçu d’achat', rcv: 'Voir le reçu', rcd: 'Télécharger l’image', rcpr: 'PDF / Imprimer', rce: 'Impossible d’afficher le reçu, réessayez plus tard.', cls: 'Fermer',
      sold: 'VENDU', warr: 'GARANTIE', mo: 'mois', mo2: 'mois', act: 'ACTIVE', exp: 'EXPIRÉE', left: 'j', svc: 'ATELIER', none: 'AUCUNE RÉPARATION', rep: 'INTERVENTION(S)', now: 'EN RÉPARATION', veh: 'VÉHICULE', brand: 'Marque', model: 'Modèle', color: 'Couleur', ser: 'N° série', km: 'Km', orig: 'PROPRIÉTAIRE D’ORIGINE', tr: 'TRANSFÉRÉ', stolen: 'DÉCLARÉ VOLÉ', disp: 'EN LITIGE', ext: 'ENREGISTRÉ', visa: 'VISA N°',
      ok: 'Passeport authentique : scooter enregistré chez MS Scooter', vstolen: 'DÉCLARÉ VOLÉ : ne l’achetez pas et contactez-nous', vdisp: 'Propriété en cours de vérification : prudence avant l’achat', nf: 'Numéro de série introuvable', nfp: 'Vérifiez le numéro inscrit sur le reçu ou sur le châssis, puis réessayez.', priv: 'L’identité est chiffrée : visible seulement avec le code du propriétaire.', loc: 'fr-FR' },
    en: { s1: 'Type the full ID number', s2: 'Press “Open”', s3: 'Place your finger on the print', fph: 'Hold with the mouse or your finger', t: 'Scooter Passport', sub: 'MS Scooter · Official registry', sec: 'Verified', alert: 'ALERT', chk: 'Check', p1: 'Identity', p2: 'Visa', p1t: 'Identity page', p2t: 'Scooter visa', sn: 'Surname', gn: 'Given names', sx: 'Sex', sxm: 'Male', sxf: 'Female', bd: 'Date of birth', pob: 'Place of birth', wil: 'Wilaya', idn: 'ID document no.', iss: 'Date of issue', pno: 'Passport no.', lkT: 'Identity protected', lkP: 'Enter your full ID document number to open the complete passport and the receipt copy.', p3: 'Receipt', p3t: 'Receipt copy', fpT: 'Place your finger on the print', fpH: 'Press and hold until the circle is complete', fpS: 'Scanning…', fpOk: 'Identity verified', idph: 'Full ID document number', rcl: 'Receipt is tied to the identity', rcg: 'Open the identity first with the full ID document number.', rco: 'Open identity', rpdf: 'Download PDF', rimg: 'Download image', rpe: 'Could not create the file, try again.',  un: 'Open', bad: 'Wrong code', noid: 'Owner identity not registered yet.', nocr: 'Cannot decrypt: HTTPS required.', own: 'Owner', loading: 'Opening…', rct: 'Receipt copy', rcs: 'A copy of your purchase receipt', rcv: 'View receipt', rcd: 'Download image', rcpr: 'PDF / Print', rce: 'Could not display the receipt, try again later.', cls: 'Close',
      sold: 'SOLD', warr: 'WARRANTY', mo: 'months', mo2: 'months', act: 'ACTIVE', exp: 'EXPIRED', left: 'd', svc: 'SERVICE', none: 'NO REPAIRS', rep: 'VISIT(S)', now: 'IN REPAIR', veh: 'VEHICLE', brand: 'Brand', model: 'Model', color: 'Colour', ser: 'Serial no.', km: 'Km', orig: 'ORIGINAL OWNER', tr: 'TRANSFERRED', stolen: 'REPORTED STOLEN', disp: 'UNDER REVIEW', ext: 'REGISTERED', visa: 'VISA NO.',
      ok: 'Authentic passport : scooter registered with MS Scooter', vstolen: 'REPORTED STOLEN : do not buy it, contact us', vdisp: 'Ownership under verification : be careful before buying', nf: 'Serial number not found', nfp: 'Check the number on the receipt or on the frame, then try again.', priv: 'Identity is encrypted: visible only with the owner’s code.', loc: 'en-GB' }
  };
  var MON = { ar: ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'], fr: ['JANV', 'FÉVR', 'MARS', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEPT', 'OCT', 'NOV', 'DÉC'], en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] };

  function lang() { var d = document.documentElement.lang; if (d === 'fr' || d === 'en' || d === 'ar') return d; try { var l = localStorage.getItem('ms-lang'); return l === 'fr' || l === 'en' ? l : 'ar'; } catch (e) { return 'ar'; } }
  function dark() { var th = document.documentElement.dataset && document.documentElement.dataset.th; if (th) return th === 'dark'; try { var t = localStorage.getItem('ms-th'); if (t) return t === 'dark'; } catch (e) {} return !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9\u0600-\u06FF]/g, ''); }
  function ncode(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  function pd(s) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function addM(d, n) { var r = new Date(d.getFullYear(), d.getMonth() + n, 1); r.setDate(Math.min(d.getDate(), new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate())); return r; }
  function fd(d, L) { try { return new Intl.DateTimeFormat(L.loc, { day: 'numeric', month: 'long', year: 'numeric' }).format(d); } catch (e) { return d.toDateString(); } }
  function sd(d) { return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.' + d.getFullYear(); }
  function slug(b) { return String(b || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
  function hash(s) { var h = 7; s = String(s); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function css() { if (document.getElementById('msp-css')) return; var s = document.createElement('style'); s.id = 'msp-css'; s.textContent = CSS; document.head.appendChild(s); }
  function find(serial) { var n = norm(serial); if (!n) return null; return (window.MS_DATA || []).filter(function (x) { return norm(x.s) === n; })[0] || null; }
  function repOf(serial) { var n = norm(serial); return (window.MS_REP || []).filter(function (x) { return norm(x.s) === n; })[0] || null; }

  /* ---- decrypt (same scheme as the app's seal(): PBKDF2-SHA256 40000 it -> 64 bytes ; HMAC-SHA256 stream cipher ; HMAC tag) ---- */
  function u8(h) { var u = new Uint8Array(h.length / 2); for (var i = 0; i < u.length; i++) u[i] = parseInt(h.substr(2 * i, 2), 16); return u; }
  function b64u(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function cat(a, b) { var r = new Uint8Array(a.length + b.length); r.set(a, 0); r.set(b, a.length); return r; }
  function openBlob(code, rep) {
    var S = window.crypto && crypto.subtle; if (!S) return Promise.reject(new Error('nocrypto'));
    var enc = new TextEncoder(), raw = b64u(rep.blob), iv = raw.slice(0, 12), tag = raw.slice(raw.length - 32), ct = raw.slice(12, raw.length - 32), ek, mk;
    return S.importKey('raw', enc.encode(ncode(code)), 'PBKDF2', false, ['deriveBits']).then(function (k) {
      return S.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: u8(rep.salt), iterations: 40000 }, k, 512);
    }).then(function (bits) {
      bits = new Uint8Array(bits); ek = bits.slice(0, 32); mk = bits.slice(32);
      return S.importKey('raw', mk, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    }).then(function (key) { return S.verify('HMAC', key, tag, cat(iv, ct)); }).then(function (ok) {
      if (!ok) return null;
      return S.importKey('raw', ek, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']).then(function (key) {
        var n = Math.ceil(ct.length / 32), jobs = [];
        for (var i = 0; i < n; i++) { var c = new Uint8Array(4); new DataView(c.buffer).setUint32(0, i); jobs.push(S.sign('HMAC', key, cat(iv, c))); }
        return Promise.all(jobs);
      }).then(function (blocks) {
        var pt = new Uint8Array(ct.length); blocks.forEach(function (b, i) { b = new Uint8Array(b); for (var j = 0; j < 32 && i * 32 + j < ct.length; j++) pt[i * 32 + j] = ct[i * 32 + j] ^ b[j]; });
        try { return JSON.parse(new TextDecoder().decode(pt)); } catch (e) { return null; }
      });
    });
  }

  /* ---- MRZ (machine readable zone, decorative but with real check digits) ---- */
  function mz(s, n) { s = String(s).toUpperCase().replace(/[^A-Z0-9<]/g, '<'); while (s.length < n) s += '<'; return s.slice(0, n); }
  function ck(s) { var w = [7, 3, 1], t = 0; for (var i = 0; i < s.length; i++) { var c = s.charAt(i), v = c === '<' ? 0 : /\d/.test(c) ? +c : c.charCodeAt(0) - 55; t += v * w[i % 3]; } return t % 10; }
  function ymd(d) { return d ? String(d.getFullYear()).slice(2) + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2) : '<<<<<<'; }
  function mrz(e, id, wEnd) {
    var l1 = 'P<DZA' + mz(id ? (id.ln + '<<' + String(id.fn).replace(/ /g, '<')) : '', 39), s9 = mz(e.s, 9), bd = id ? ymd(pd(id.bd)) : '<<<<<<', ex = ymd(wEnd);
    var l2 = s9 + ck(s9) + 'DZA' + bd + ck(bd) + (id && id.sex ? id.sex.toUpperCase() : '<') + ex + ck(ex) + mz(e.b + e.m, 16);
    return esc(l1) + '<br>' + esc(l2.slice(0, 44));
  }

  /* ---- stamps ---- */
  var sid = 0;
  function ring(top, bot, c1, c2, col) {
    var i = ++sid;
    return '<svg viewBox="0 0 200 200" style="color:' + col + '"><defs><path id="mt' + i + '" d="M 26,100 A 74,74 0 0 1 174,100"/><path id="mb' + i + '" d="M 14,100 A 86,86 0 0 0 186,100"/></defs>' +
      '<circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" stroke-width="2.5"/>' +
      '<text font-size="15" font-weight="900" letter-spacing="2.4" fill="currentColor" text-anchor="middle"><textPath href="#mt' + i + '" startOffset="50%">' + esc(top) + '</textPath></text>' +
      '<text font-size="14" font-weight="900" letter-spacing="2" fill="currentColor" text-anchor="middle" dy="3"><textPath href="#mb' + i + '" startOffset="50%">' + esc(bot) + '</textPath></text>' +
      '<text x="100" y="104" font-size="44" font-weight="900" fill="currentColor" text-anchor="middle">' + esc(c1) + '</text><text x="100" y="128" font-size="17" font-weight="900" fill="currentColor" text-anchor="middle" letter-spacing="1">' + esc(c2) + '</text>' +
      '<text x="36" y="104" font-size="14" fill="currentColor" text-anchor="middle">★</text><text x="164" y="104" font-size="14" fill="currentColor" text-anchor="middle">★</text></svg>';
  }
  function barcode(seed) { var h = hash(seed), b = '', x = 0, w; for (var i = 0; i < 46; i++) { h = (h * 1103515245 + 12345) >>> 0; w = 1 + (h >>> 8) % 3; if (i % 2 === 0) b += '<rect x="' + x + '" y="0" width="' + w + '" height="26"/>'; x += w; } return '<svg class="msp-bc" viewBox="0 0 ' + x + ' 26" preserveAspectRatio="none" fill="#1f2937">' + b + '</svg>'; }

  /* ---- receipt copy : opens in an overlay ; PNG download, or PDF through the print dialog.  Needs qr.js + bg.js + receipt.js next to this page (same files as the app uses) ---- */
  var rcLoad = null;
  function loadJS(src) { return new Promise(function (ok, ko) { var el = document.createElement('script'); el.src = src; el.onload = ok; el.onerror = function () { ko(new Error(src)); }; document.head.appendChild(el); }); }
  function needRc() {
    var ok = function () { return window.MSReceipt && window.MS_BG && typeof window.qrcode === 'function'; };
    if (ok()) return Promise.resolve();
    if (!rcLoad) rcLoad = (typeof window.qrcode === 'function' ? Promise.resolve() : loadJS('qr.js')).then(function () { return window.MS_BG ? 0 : loadJS('bg.js'); }).then(function () { return window.MSReceipt ? 0 : loadJS('receipt.js'); }).then(function () { if (!ok()) throw new Error('rc'); }).catch(function (x) { rcLoad = null; throw x; });
    return rcLoad;
  }
  function fontStyles() { return [].filter.call(document.querySelectorAll('style'), function (t) { return /@font-face/.test(t.textContent) && /Cairo|MSMont/.test(t.textContent); }).map(function (t) { return t.textContent; }).join('\n'); }
  function printSheet(sheet, name) {
    var f = document.createElement('iframe'); f.setAttribute('aria-hidden', 'true'); f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    document.body.appendChild(f);
    var w = f.contentWindow, d = w.document;
    d.open(); d.write('<!doctype html><html><head><meta charset="utf-8"><title>' + esc(name) + '</title><base href="' + esc(document.baseURI) + '"><style>' + fontStyles() + '@page{size:A4;margin:0}html,body{margin:0;background:#fff}svg{width:210mm!important;height:297mm!important;display:block}</style></head><body>' + sheet.innerHTML + '</body></html>'); d.close();
    var go = function () { try { w.focus(); w.print(); } catch (e) {} setTimeout(function () { if (f.parentNode) f.parentNode.removeChild(f); }, 60000); };
    (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(function () { setTimeout(go, 200); });
  }
  function dataUrl(u) { return fetch(u).then(function (x) { if (!x.ok) throw new Error('f'); return x.blob(); }).then(function (b) { return new Promise(function (ok) { var fr = new FileReader(); fr.onload = function () { ok(fr.result); }; fr.readAsDataURL(b); }); }); }
  function savePng(sheet, name) {
    var svg = sheet.querySelector('svg'); if (!svg) return Promise.reject(new Error('svg'));
    return dataUrl('Cairo.ttf').catch(function () { return ''; }).then(function (cairo) {
      var c = svg.cloneNode(true), W = 1489, Hh = 2106, css = '';
      var mm = [].filter.call(document.querySelectorAll('style'), function (t) { return /MSMont/.test(t.textContent) && /@font-face/.test(t.textContent); })[0];
      if (mm) css += mm.textContent;
      if (cairo) css += '@font-face{font-family:Cairo;src:url(' + cairo + ');font-weight:200 1000}';
      c.removeAttribute('style'); c.setAttribute('width', W); c.setAttribute('height', Hh);
      var st = document.createElementNS('http://www.w3.org/2000/svg', 'style'); st.textContent = css; c.insertBefore(st, c.firstChild);
      var xml = new XMLSerializer().serializeToString(c);
      return new Promise(function (ok, ko) {
        var im = new Image();
        im.onload = function () {
          var cv = document.createElement('canvas'); cv.width = W; cv.height = Hh; var x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, Hh); x.drawImage(im, 0, 0, W, Hh);
          cv.toBlob(function (b) { if (!b) return ko(new Error('blob')); var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name + '.png'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); if (a.parentNode) a.parentNode.removeChild(a); }, 2000); ok(); }, 'image/png');
        };
        im.onerror = function () { ko(new Error('img')); };
        im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
      });
    });
  }
  function openRcp(rcp, act) {
    if (!rcp) return;
    var lg = lang(), L = T[lg], name = 'MS-Scooter-' + String((rcp.d && (rcp.d.rno || rcp.d.serial)) || 'recu').replace(/[^A-Za-z0-9_-]+/g, '');
    var ov = document.createElement('div'); ov.className = 'msp-rv' + (dark() ? ' dark' : ''); ov.setAttribute('dir', lg === 'ar' ? 'rtl' : 'ltr'); ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = '<div class="msp-rvb"><div class="msp-rvh"><b>' + esc(L.rct) + '</b><button type="button" class="x" data-a="x" aria-label="' + esc(L.cls) + '">✕</button></div><div class="msp-rvs"><div class="msp-sheet"><p class="msp-rvl">' + esc(L.loading) + '</p></div></div><div class="msp-rvf"><button type="button" data-a="d">' + esc(L.rcd) + '</button><button type="button" data-a="p" class="alt">' + esc(L.rcpr) + '</button></div></div>';
    document.body.appendChild(ov);
    var prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    var sheet = ov.querySelector('.msp-sheet'), ready = false, busy = false;
    function key(e) { if (e.key === 'Escape') close(); }
    function close() { document.body.style.overflow = prev; document.removeEventListener('keydown', key); if (ov.parentNode) ov.parentNode.removeChild(ov); }
    document.addEventListener('keydown', key);
    function run(a) {
      if (!ready || busy) return;
      if (a === 'p') printSheet(sheet, name);
      else if (a === 'd') { busy = true; savePng(sheet, name).catch(function () { printSheet(sheet, name); }).then(function () { busy = false; }); }
    }
    ov.onclick = function (e) { var a = e.target.getAttribute && e.target.getAttribute('data-a'); if (e.target === ov || a === 'x') { close(); return; } if (a) run(a); };
    needRc().then(function () {
      window.MSReceipt.render(sheet, rcp.d, { copy: true, qrUrl: rcp.q }); ready = true;
      if (act === 'd' || act === 'p') setTimeout(function () { run(act); }, 800);
    }).catch(function () { sheet.innerHTML = '<p class="msp-rvl">' + esc(L.rce) + '</p>'; });
  }

  /* ---- direct PDF : the receipt sheet -> JPEG -> single-page A4 PDF (no library) ---- */
  function savePdf(sheet, name) {
    var svg = sheet.querySelector('svg'); if (!svg) return Promise.reject(new Error('svg'));
    return dataUrl('Cairo.ttf').catch(function () { return ''; }).then(function (cairo) {
      var c = svg.cloneNode(true), W = 1240, Hh = 1754, css = '';
      var mm = [].filter.call(document.querySelectorAll('style'), function (t) { return /MSMont/.test(t.textContent) && /@font-face/.test(t.textContent); })[0];
      if (mm) css += mm.textContent;
      if (cairo) css += '@font-face{font-family:Cairo;src:url(' + cairo + ');font-weight:200 1000}';
      c.removeAttribute('style'); c.setAttribute('width', W); c.setAttribute('height', Hh);
      var st = document.createElementNS('http://www.w3.org/2000/svg', 'style'); st.textContent = css; c.insertBefore(st, c.firstChild);
      var xml = new XMLSerializer().serializeToString(c);
      return new Promise(function (ok, ko) {
        var im = new Image();
        im.onload = function () {
          var cv = document.createElement('canvas'); cv.width = W; cv.height = Hh; var x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, Hh); x.drawImage(im, 0, 0, W, Hh);
          cv.toBlob(function (b) {
            if (!b) return ko(new Error('blob'));
            var fr = new FileReader(); fr.onload = function () {
              var jpg = new Uint8Array(fr.result), enc = new TextEncoder(), parts = [], pos = 0, offs = [];
              function put(x) { var u = typeof x === 'string' ? enc.encode(x) : x; parts.push(u); pos += u.length; }
              function obj(n, body) { offs[n] = pos; put(n + ' 0 obj\n'); put(body); put('\nendobj\n'); }
              put('%PDF-1.4\n');
              obj(1, '<< /Type /Catalog /Pages 2 0 R >>'); obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
              obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>');
              var cs = 'q 595.28 0 0 841.89 0 0 cm /Im0 Do Q'; obj(4, '<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream');
              offs[5] = pos; put('5 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + W + ' /Height ' + Hh + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpg.length + ' >>\nstream\n'); put(jpg); put('\nendstream\nendobj\n');
              var xr = pos; put('xref\n0 6\n0000000000 65535 f \n'); for (var i = 1; i < 6; i++) put(('0000000000' + offs[i]).slice(-10) + ' 00000 n \n');
              put('trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xr + '\n%%EOF');
              var out = new Blob(parts, { type: 'application/pdf' }), a = document.createElement('a'); a.href = URL.createObjectURL(out); a.download = name + '.pdf'; document.body.appendChild(a); a.click();
              setTimeout(function () { URL.revokeObjectURL(a.href); if (a.parentNode) a.parentNode.removeChild(a); }, 2000); ok();
            }; fr.onerror = function () { ko(new Error('fr')); }; fr.readAsArrayBuffer(b);
          }, 'image/jpeg', 0.92);
        };
        im.onerror = function () { ko(new Error('img')); };
        im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
      });
    });
  }
  /* receipt tab : inline preview + PDF / image download */
  function mountRc(host, rcp, L) {
    var name = 'MS-Scooter-' + String((rcp.d && (rcp.d.rno || rcp.d.serial)) || 'recu').replace(/[^A-Za-z0-9_-]+/g, '');
    host.innerHTML = '<div class="msp-rt3"><div class="hd"><span class="ri">' + SV.doc + '</span><div><b>' + esc(L.rct) + '</b><small>' + esc(L.rcs) + '</small></div></div><div class="sheet"><p class="msp-rvl">' + esc(L.loading) + '</p></div><div class="rb"><button type="button" data-a="pdf" disabled>' + esc(L.rpdf) + '</button><button type="button" data-a="png" class="alt" disabled>' + esc(L.rimg) + '</button></div></div>';
    var sheet = host.querySelector('.sheet'), btns = host.querySelectorAll('button'), busy = false;
    function en(v) { [].forEach.call(btns, function (b) { b.disabled = !v; }); }
    needRc().then(function () { window.MSReceipt.render(sheet, rcp.d, { copy: true, qrUrl: rcp.q }); en(true); }).catch(function () { sheet.innerHTML = '<p class="msp-rvl">' + esc(L.rce) + '</p>'; });
    host.onclick = function (ev) {
      var a = ev.target.getAttribute && ev.target.getAttribute('data-a'); if (!a || busy) return; busy = true; en(false);
      (a === 'pdf' ? savePdf(sheet, name) : savePng(sheet, name)).catch(function () { printSheet(sheet, name); }).then(function () { busy = false; en(true); });
    };
  }

  /* ---- render ---- */
  function render(el, serial, opt) {
    css(); opt = opt || {}; var lg = lang(), L = T[lg], e = find(serial), isDark = dark();
    el.setAttribute('dir', lg === 'ar' ? 'rtl' : 'ltr');
    if (!e) { el.innerHTML = '<div class="msp' + (isDark ? ' dark' : '') + ' warn"><div class="msp-shine"><div class="msp-in"><div class="msp-nf"><b>' + esc(L.nf) + '</b><p>' + esc(L.nfp) + '</p></div></div></div></div>'; return null; }
    var st = e.o && e.o.s || '', cls = st === 'v' ? 'bad' : st === 'l' ? 'warn' : '', badge = st === 'v' ? ['bad', L.alert] : st === 'l' ? ['warn', L.chk] : ['ok', L.sec];
    var d = pd(e.d), w = +e.w || 0, end = d && w > 0 ? addM(d, w) : null, now = new Date(), left = end ? Math.ceil((end - now) / 864e5) : 0, active = end && left > 0;
    var r = repOf(e.s), n = r ? +r.v || 0 : 0, rot = function (k) { return ((hash(e.s + k) % 13) - 6) + 'deg'; };
    var city = (window.MS_SITE && (MS_SITE.city || MS_SITE.ci)) || '';

    /* page 2 : visa */
    var stamps = '';
    stamps += '<div class="pst" style="--r:' + rot('a') + ';width:84%;max-width:190px">' + ring('MS SCOOTER ' + (city ? '· ' + String(city).toUpperCase() : ''), L.sold + ' · SOLD', d ? ('0' + d.getDate()).slice(-2) : '--', d ? MON[lg][d.getMonth()] + ' ' + d.getFullYear() : '', '#1d4ed8') + '</div>';
    var wc = !end ? '#6b7280' : active ? '#15803d' : '#b91c1c';
    stamps += '<div class="pst" style="--r:' + rot('b') + ';--k:' + wc + ';width:100%"><div class="pst-r"><small>' + esc(L.warr) + ' · WARRANTY</small><strong>' + (w ? w + ' ' + (lg === 'ar' && w > 10 ? L.mo2 : L.mo) : '—') + '</strong>' +
      (end ? '<em>' + sd(d) + ' → ' + sd(end) + '</em><div style="margin-top:6px"><span class="pst-big" style="display:inline-block;font-size:14px;padding:2px 9px;white-space:nowrap;letter-spacing:.06em">' + esc(active ? L.act : L.exp) + (active ? ' · ' + left + ' ' + L.left : '') + '</span></div>' : '') + '</div></div>';
    var rc = r && r.st ? '#c2410c' : n > 0 ? '#1d4ed8' : '#15803d';
    stamps += '<div class="pst" style="--r:' + rot('c') + ';--k:' + rc + ';width:100%"><div class="pst-r oval"><small>' + esc(L.svc) + ' · SERVICE</small><strong>' + (r && r.st ? esc(L.now) : n > 0 ? n + ' ' + esc(L.rep) : esc(L.none)) + '</strong></div></div>';
    var oc = st === 'v' ? '#b91c1c' : st === 'l' ? '#c2410c' : '#15803d', otx = st === 'v' ? L.stolen : st === 'l' ? L.disp : (e.o && e.o.c) ? L.tr + ' ×' + e.o.c : e.x ? L.ext : L.orig;
    stamps += '<div class="pst" style="--r:' + rot('d') + ';--k:' + oc + '"><div class="pst-big" style="font-size:' + (otx.length > 16 ? 15 : 19) + 'px">' + esc(otx) + '</div></div>';
    stamps += '<div class="pst w2" style="--r:' + (rot('e').replace('deg', '') / 2) + 'deg;--k:#1f2937;width:100%"><div class="pst-r dash"><small>' + esc(L.veh) + ' · VEHICLE</small>' +
      '<div class="row"><span>' + esc(L.brand) + '</span><span>' + esc(e.b) + '</span></div><div class="row"><span>' + esc(L.model) + '</span><span>' + esc(e.m) + (e.v ? ' · VIP' : '') + '</span></div>' +
      (e.c ? '<div class="row"><span>' + esc(L.color) + '</span><span>' + esc(e.c) + '</span></div>' : '') + '<div class="row"><span>' + esc(L.ser) + '</span><span>' + esc(e.s) + '</span></div>' + (e.k ? '<div class="row"><span>' + esc(L.km) + '</span><span>' + esc(e.k) + ' km</span></div>' : '') + '</div></div>';
    stamps += '<div class="pst" style="--r:' + rot('f') + ';--k:#7c3aed"><div class="pst-logo"><img src="brand-' + esc(slug(e.b)) + '.webp" alt="" onerror="this.parentNode.innerHTML=\'<span>' + esc((e.b || '?').charAt(0).toUpperCase()) + '</span>\'"></div></div>';
    if (e.v) stamps += '<div class="pst" style="--r:' + rot('g') + ';--k:#b45309"><div class="pst-big">★ VIP ★</div></div>';
    var page2 = '<div class="msp-pp msp-visa"><div class="msp-ph"><b>' + esc(L.p2t) + '</b><small>' + esc(L.sub) + '</small></div><div class="msp-st">' + stamps + '</div>' +
      '<div class="msp-vn"><span>' + esc(L.visa) + ' ' + esc(e.r || e.s) + '</span>' + barcode(e.s) + '</div></div>';

    /* page 1 : identity (locked until the owner's code opens MS_REP) */
    function page1(id, locked, msg, rcp) {
      var HN = r && r.h || null, sexK = id ? id.sex : (HN && HN.sx) || '', sexC = sexK === 'f' ? 'f' : 'm';
      var half = function (w) { var q = Array.from(String(w)), k = q.length > 1 ? Math.ceil(q.length / 2) : 0; return q.slice(0, k).join('') + new Array(q.length - k + 1).join('•'); };
      /* locked : only the half-masked hint published next to the encrypted blob (never the full value) ; unlocked : the real value */
      var fld = function (lab, val, ltr, hint) {
        var inner = !locked ? (val ? esc(val) : '—') : hint ? '<bdi>' + esc(hint).replace(/•+/g, function (m) { return '<span class="msp-dots">' + m + '</span>'; }) + '</bdi>' : '••••••••';
        return '<div class="msp-f"><small>' + esc(lab) + '</small><b' + (locked && !hint ? ' class="lkd"' : '') + (ltr ? ' style="direction:ltr;unicode-bidi:isolate;text-align:start"' : '') + '>' + inner + '</b></div>';
      };
      var bdT = id && pd(id.bd) ? fd(pd(id.bd), L) : '';
      var sexT = id ? (id.sex === 'm' ? L.sxm : id.sex === 'f' ? L.sxf : '') : '';
      var idT = id ? (id.idn ? String(id.idn) : id.idl ? '•••••••' + id.idl : '') : '', idH = HN && HN.idl ? '•••••••••••' + String(HN.idl).slice(-3) : '';
      var stp = function (n) { return '<ol class="msp-stp">' + [L.s1, L.s2, L.s3].map(function (t, i) { return '<li class="' + (i + 1 < n ? 'dn' : i + 1 === n ? 'on' : '') + '">' + esc(t) + '</li>'; }).join('') + '</ol>'; }; window.__stp = stp;
      var form = '';
      if (locked) form = r ? '<div class="msp-ul"><b>' + SV.lock.replace('<svg', '<svg width="16" height="16"') + esc(L.lkT) + '</b><p>' + esc(L.lkP) + '</p>' + stp(1) + '<form><input maxlength="24" placeholder="' + esc(L.idph) + '" autocomplete="off" spellcheck="false" inputmode="text" aria-label="' + esc(L.idph) + '"><button>' + esc(L.un) + '</button></form><div class="er">' + esc(msg || '') + '</div></div>' : '<div class="msp-ul"><p style="margin:0">' + esc(L.noid) + '</p></div>';
      else if (!id) form = '<div class="msp-ul"><p style="margin:0">' + esc(L.noid) + '</p></div>';
      var rc = false && rcp ? '<div class="msp-rc"><div class="rt"><span class="ri">' + SV.doc + '</span><div><b>' + esc(L.rct) + '</b><small>' + esc(L.rcs) + '</small></div></div><div class="rb"><button type="button" data-a="v">' + esc(L.rcv) + '</button><button type="button" data-a="d" class="alt">' + esc(L.rcd) + '</button><button type="button" data-a="p" class="alt">' + esc(L.rcpr) + '</button></div></div>' : '';
      return '<div class="msp-pp"><div class="msp-ph"><b>' + esc(L.p1t) + '</b><small>' + esc(L.sub) + '</small></div>' +
        '<div class="msp-i1"><div class="msp-photo ' + sexC + '">' + (sexC === 'f' ? SV.wom : SV.man) + (locked ? '<span class="lkb">' + SV.lock + '</span>' : (id && id.sex ? '<span class="sx">' + (sexC === 'm' ? 'M' : 'F') + '</span>' : '')) + '</div>' +
        '<div class="msp-fl">' + fld(L.sn, id && id.ln, 0, HN && HN.ln) + fld(L.gn, id && id.fn, 0, HN && HN.fn) + fld(L.sx, sexT, 0, HN && HN.sx ? (HN.sx === 'f' ? L.sxf : L.sxm) : '') + fld(L.bd, bdT, locked, HN && HN.bd) + fld(L.pob, id && id.pob, 0, HN && HN.pob) + '</div></div>' +
        '<div class="msp-f2">' + fld(L.wil, id && id.wil, 0, HN && HN.wil) + fld(L.idn, idT, 1, idH) + '<div class="msp-f"><small>' + esc(L.iss) + '</small><b>' + (d ? esc(fd(d, L)) : '—') + '</b></div><div class="msp-f"><small>' + esc(L.pno) + '</small><b style="direction:ltr;unicode-bidi:isolate">' + esc(e.s) + '</b></div></div>' +
        (locked ? '<div class="msp-f" style="margin-top:8px"><small>' + esc(L.own) + '</small><b style="direction:ltr;unicode-bidi:isolate">' + esc(e.n || '—') + '</b></div>' : '') + form + rc +
        '<div class="msp-mrz">' + mrz(e, id, end) + '</div></div>';
    }
    var verdict = st === 'v' ? ['bad', SV.bad, L.vstolen] : st === 'l' ? ['warn', SV.bad, L.vdisp] : ['ok', SV.ok, L.ok], page = opt.page === 2 ? 2 : 1;
    el.innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="msp-ink" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" result="d"/><feTurbulence type="fractalNoise" baseFrequency="0.05 0.9" numOctaves="2" seed="9" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.7 1.75" result="m"/><feComposite in="d" in2="m" operator="in"/></filter></svg>' +
      '<div class="msp' + (isDark ? ' dark' : '') + (cls ? ' ' + cls : '') + '"><div class="msp-shine"><div class="msp-scan"></div><div class="msp-in">' +
      '<div class="msp-top"><div class="msp-id"><div class="msp-ic">' + SV.fp + '</div><div><b>' + esc(L.t) + '</b><small>' + esc(e.b) + ' ' + esc(e.m) + '</small></div></div><span class="msp-bdg ' + badge[0] + '"><i></i>' + esc(badge[1]) + '</span></div>' +
      '<div class="msp-tabs" role="tablist"><button type="button" data-p="1">' + esc(L.p1) + '</button><button type="button" data-p="2">' + esc(L.p2) + '</button><button type="button" data-p="3">' + esc(L.p3) + '</button></div>' +
      '<div class="msp-book"><div class="msp-pg" data-pg="1"></div><div class="msp-pg off" data-pg="2">' + page2 + '</div><div class="msp-pg off" data-pg="3"><div class="msp-pp"><div class="msp-ph"><b>' + esc(L.p3t) + '</b><small>' + esc(L.sub) + '</small></div><div class="p3"></div></div></div></div>' +
      '<div class="msp-v ' + verdict[0] + '">' + verdict[1] + '<span>' + esc(verdict[2]) + '</span></div><p class="msp-ft">' + esc(L.priv) + '</p></div></div></div>';

    var p1 = el.querySelector('[data-pg="1"]'), p3 = el.querySelector('.p3'), pgs = el.querySelectorAll('.msp-pg'), tabs = el.querySelectorAll('.msp-tabs button'), cur = 1, st3 = { locked: true, rcp: null, done: false };
    function mount3() {
      if (st3.done) return; st3.done = true;
      if (st3.locked) { p3.innerHTML = '<div class="msp-rtl"><span class="lk">' + SV.lock + '</span><b>' + esc(L.rcl) + '</b><p>' + esc(L.rcg) + '</p><button type="button">' + esc(L.rco) + '</button></div>'; p3.querySelector('button').onclick = function () { go(1); var i = p1.querySelector('input'); if (i) i.focus(); }; }
      else if (st3.rcp) mountRc(p3, st3.rcp, L);
      else p3.innerHTML = '<div class="msp-rtl"><p>' + esc(L.rce) + '</p></div>';
    }
    function go(n) { cur = +n; [].forEach.call(pgs, function (p) { p.classList.toggle('off', p.getAttribute('data-pg') != n); }); [].forEach.call(tabs, function (t) { t.classList.toggle('on', t.getAttribute('data-p') == n); }); if (+n === 3) mount3(); }
    function tryOpen(v) {
      var first = r && r.ik ? openBlob(v, r.ik) : Promise.resolve(null);
      return first.then(function (o) { if (o) return { o: o, byId: true, code: v }; return openBlob(v, r).then(function (o2) { return o2 ? { o: o2, code: v } : null; }); });
    }
    /* after the ID is accepted : hold-to-scan fingerprint, then the full passport opens */
    function fpStage(res) {
      var ul = p1.querySelector('.msp-ul'); if (!ul) return;
      ul.className = 'msp-fpd';
      ul.innerHTML = '<b>' + esc(L.fpT) + '</b>' + window.__stp(3) + '<p>' + esc(L.fph) + '</p><button type="button" class="msp-fpb" aria-label="' + esc(L.fpT) + '"><svg class="rg" viewBox="0 0 116 116"><circle class="t" cx="58" cy="58" r="54"/><circle class="f" cx="58" cy="58" r="54"/></svg>' + SV.fp.replace('<svg', '<svg class="ic"') + '<i class="sl"></i></button><span class="msp-hand" aria-hidden="true">👆</span><div class="st"></div>';
      var btn = ul.querySelector('button'), st = ul.querySelector('.st'), tm = 0, fin = false;
      function start(ev) { if (fin) return; if (ev && ev.preventDefault) ev.preventDefault(); btn.classList.add('hold'); st.textContent = L.fpS; clearTimeout(tm); tm = setTimeout(done, 1200); }
      function stop() { if (fin) return; clearTimeout(tm); btn.classList.remove('hold'); st.textContent = ''; }
      function done() {
        fin = true; btn.classList.remove('hold'); btn.classList.add('done'); st.className = 'st ok'; st.textContent = L.fpOk; try { if (navigator.vibrate) navigator.vibrate(40); } catch (x) {}
        setTimeout(function () { var o = res.o, id = o.id || null; if (id && res.byId && !id.idn) { id = JSON.parse(JSON.stringify(id)); id.idn = ncode(res.code); } draw(id, false, '', o.rcp || null); }, 750);
      }
      btn.addEventListener('pointerdown', start); ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (k) { btn.addEventListener(k, stop); });
      btn.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });
      btn.addEventListener('keydown', function (ev) { if ((ev.key === ' ' || ev.key === 'Enter') && !ev.repeat) start(ev); }); btn.addEventListener('keyup', stop); btn.addEventListener('blur', stop);
      btn.focus();
    }
    function draw(id, locked, msg, rcp) {
      p1.innerHTML = page1(id, locked, msg, rcp);
      st3.locked = locked; st3.rcp = rcp; st3.done = false; p3.innerHTML = ''; if (cur === 3) mount3();
      var f = p1.querySelector('form'); if (!f) return;
      f.onsubmit = function (ev) {
        ev.preventDefault(); var inp = f.querySelector('input'), er = p1.querySelector('.er'), v = inp.value; if (ncode(v).length < 6) { er.textContent = L.bad; return; }
        er.textContent = L.loading;
        tryOpen(v).then(function (res) { if (!res) { er.textContent = L.bad; return; } fpStage(res); }).catch(function (x) { er.textContent = x && x.message === 'nocrypto' ? L.nocr : L.bad; });
      };
    }
    draw(null, true);
    [].forEach.call(tabs, function (t) { t.onclick = function () { go(t.getAttribute('data-p')); }; });
    var sx = 0; el.addEventListener('touchstart', function (ev) { sx = ev.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', function (ev) { var dx = ev.changedTouches[0].clientX - sx; if (Math.abs(dx) > 70 && !/INPUT|BUTTON/.test((ev.target || {}).tagName || '')) go(Math.max(1, Math.min(3, cur + ((dx < 0) === (lg !== 'ar') ? 1 : -1)))); }, { passive: true });
    go(page);
    return e;
  }
  window.MSPassport = { render: render, find: find, lang: lang };
})();
