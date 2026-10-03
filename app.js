// INKBORN visitor's notebook - interactions
const $ = s => document.querySelector(s);

// mobile menu
const menuBtn = $('#menuBtn'), mobileMenu = $('#mobileMenu');
menuBtn.onclick = () => {
  mobileMenu.style.display = mobileMenu.style.display === 'flex' ? 'none' : 'flex';
};
mobileMenu.querySelectorAll('a').forEach(a => a.onclick = () => mobileMenu.style.display = 'none');

// ticker: JS-driven marquee, moves no matter the OS motion setting
(function ticker() {
  const el = document.getElementById('marquee');
  if (!el) return;
  el.textContent = (el.textContent + el.textContent).slice(0, 640);
  let x = 0, last = performance.now();
  const speed = 45;
  setInterval(() => {
    const now = performance.now();
    const dt = Math.min(100, now - last); last = now;
    const half = el.scrollWidth / 2;
    x -= speed * dt / 1000;
    if (half > 0 && x <= -half) x += half;
    el.style.transform = 'translateX(' + x + 'px)';
  }, 50);
})();

// mini hero terminal
const miniForm = $('#miniForm'), miniInput = $('#miniInput'), miniScene = $('#miniScene');
miniForm.onsubmit = e => {
  e.preventDefault();
  const v = miniInput.value.toLowerCase();
  if (v.includes('open')) {
    miniScene.textContent = 'door: OPEN — rewritten in ink ✓';
    miniScene.style.borderColor = '#3dff9e'; miniScene.style.color = '#3dff9e';
  } else if (v.includes('lock')) {
    miniScene.textContent = 'door: LOCKED. it knows you\'re here.';
    miniScene.style.borderColor = '#ff3b5c'; miniScene.style.color = '#ff7a90';
  } else if (v.trim()) {
    miniScene.textContent = '"' + miniInput.value + '" in ink... the walls tremble...';
    miniScene.style.borderColor = '#3a332a'; miniScene.style.color = '#43e8ff';
  }
  miniInput.value = '';
};

// ---- playable mini text adventure ----
const log = $('#gameLog'), form = $('#gameForm'), input = $('#gameInput');
const state = { door:false, light:false, terminalRead:false, north:false, sanity:100 };

function say(html, cls='') {
  const div = document.createElement('div');
  div.className = cls; div.innerHTML = html;
  log.appendChild(div); log.scrollTop = log.scrollHeight;
}
function init() {
  say('INKBORN KOMPLEX // ROOM-07 — connection established.', 'sys-msg');
  say('You wake up in a cold room. Your head throbs. There is a <b>door</b> [locked], a flickering ink <b>terminal</b>, a dim <b>lamp</b>.', '');
  say('Hint: <b>read terminal</b> — you will rewrite reality in ink from there.', 'ok');
}
function cmd(raw) {
  const t = ' ' + raw.toLowerCase() + ' ';
  say('&gt; ' + raw, 'echo');
  const has = (...ws) => ws.some(w => t.includes(w));

  if (has('help', 'commands')) {
    say('Commands: <b>look around</b> • <b>read terminal</b> • <b>open door</b> • <b>turn on light</b> • <b>go north</b> • <b>status</b>', 'sys-msg');
    return;
  }
  if (has('status', 'sanity', 'health')) {
    say(`Sanity: ${state.sanity}% | Door: ${state.door?'OPEN':'LOCKED'} | Light: ${state.light?'ON':'OFF'}`, 'sys-msg');
    return;
  }
  if (has('look', 'inspect', 'search', 'around', 'examine')) {
    say('Room: damp walls, an old <b>battery</b> on the floor, a <b>wooden box</b> on the shelf, an ink <b>terminal</b> buzzing in the corner. Above the door, written in ink: "TRUST YOUR INTUITION".', '');
    if (!state.light) say('Too dark. Try to <b>turn on light</b>.', 'warn');
    return;
  }
  if (has('terminal', 'laptop', 'computer', 'read', 'write', 'ink')) {
    state.terminalRead = true;
    say('terminal: <br><code>room-07.definition = "dark, locked, silent"</code><br>Ink cursor dripping. Rewrite one word: try <b>turn on light</b> or <b>open door</b>.', 'ok');
    return;
  }
  if (has('light', 'lamp', 'bright', 'turn on', 'switch on')) {
    if (!state.terminalRead) { say('First <b>read terminal</b>. Reality is written in ink from there.', 'warn'); return; }
    state.light = true;
    say('You wash away "dark" → write <b>"bright"</b> in ink. The lamp crackles on. Scratch marks appear on the walls...', 'ok');
    return;
  }
  if (has('door', 'open', 'unlock')) {
    if (!state.terminalRead) { say('The door is cold and unresponsive. First <b>read terminal</b>.', 'warn'); return; }
    if (!state.light) { say('You cannot find the word in the dark. First <b>turn on light</b>.', 'bad'); state.sanity -= 5; return; }
    state.door = true;
    say('"locked" → <b>"open"</b>. <i>CLANK.</i> The door swings ajar. Rain sounds drift from the cold corridor...', 'ok');
    say('Type <b>go north</b> to step into the corridor.', 'sys-msg');
    return;
  }
  if (has('north', 'corridor', 'go', 'exit', 'escape', 'leave')) {
    if (!state.door) { say('The door is locked. Rewrite reality first.', 'bad'); return; }
    if (has('left', 'fire', 'warm')) {
      say('A small fireplace. Rain hits the window. Sanity restored. <b>+20 sanity.</b> A note in ink: "Inkborn loves you. Stay." — to be continued in the demo...', 'ok');
      state.sanity = Math.min(100, state.sanity + 20);
      say('You finished the mini chapter! Keep an eye out for the full demo.', 'ok');
      return;
    }
    if (has('right', 'dark', 'whisper')) {
      state.sanity -= 30;
      say('You walk into the darkness. Something EATS you. You wake up in the room again. (sanity -30)', 'bad');
      state.door = false; state.north = false;
      return;
    }
    state.north = true;
    say('Corridor: two ways — <b>left</b>, crackling fire and warmth, <b>right</b>, deep darkness and whispers. Which one? <b>go left</b> / <b>go right</b>', 'warn');
    return;
  }
  if (has('left', 'fire', 'warm')) {
    if (!state.north) { say('Go to the northern corridor first.', 'warn'); return; }
    say('A small fireplace. Rain hits the window. Sanity restored. <b>+20 sanity.</b> A note in ink: "Inkborn loves you. Stay." — to be continued in the demo...', 'ok');
    state.sanity = Math.min(100, state.sanity + 20);
    say('You finished the mini chapter! Keep an eye out for the full demo.', 'ok');
    return;
  }
  if (has('right', 'dark', 'whisper')) {
    if (!state.north) { say('Go to the northern corridor first.', 'warn'); return; }
    state.sanity -= 30;
    say('You walk into the darkness. Something EATS you. You wake up in the room again. (sanity -30)', 'bad');
    state.door = false; state.north = false;
    return;
  }
  if (has('battery', 'box', 'take', 'pick', 'wooden')) {
    say('You pick up a small <b>battery</b>. The terminal glows a bit brighter. (Players collect batteries for 100%!)', 'ok');
    return;
  }
  if (has('hello', 'hi', 'hey')) { say('Inkborn whispers: "...hello..."', 'sys-msg'); return; }
  say('Inkborn does not understand: "' + raw + '"? Type <b>help</b>.', 'sys-msg');
}
form.onsubmit = e => { e.preventDefault(); const v = input.value.trim(); if (!v) return; input.value=''; cmd(v); };
document.querySelectorAll('.hint-row button').forEach(b => b.onclick = () => cmd(b.dataset.cmd));
init();

// slow embers over the hero (calm drift, no flicker)
(function embers() {
  const cv = document.getElementById('embers');
  const hero = document.querySelector('.hero');
  if (!cv || !hero) return;
  const ctx = cv.getContext('2d');
  let W, H, parts = [];
  const size = () => {
    W = cv.width = hero.offsetWidth;
    H = cv.height = hero.offsetHeight;
    parts = Array.from({length: Math.min(46, Math.floor(W / 28))}, () => spawn(true));
  };
  const spawn = anywhere => ({
    x: Math.random() * W,
    y: anywhere ? Math.random() * H : H + 6,
    r: .8 + Math.random() * 2.1,
    vy: .12 + Math.random() * .3,
    vx: (Math.random() - .5) * .12,
    a: .12 + Math.random() * .3
  });
  size(); addEventListener('resize', size);
  (function tick() {
    if (!document.hidden) {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.y -= p.vy; p.x += p.vx;
        if (p.y < -8) Object.assign(p, spawn(false));
        ctx.globalAlpha = p.a;
        ctx.fillStyle = '#ffb35c';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(tick);
  })();
})();

// faint lamp-light following the cursor across the hero (fine pointers only)
(function glow() {
  if (!matchMedia('(hover: hover)').matches) return;
  const hero = document.querySelector('.hero'), lamp = document.querySelector('.hero-glow');
  if (!hero || !lamp) return;
  hero.addEventListener('mousemove', e => {
    const b = hero.getBoundingClientRect();
    lamp.style.transform = `translate(${e.clientX - b.left}px,${e.clientY - b.top}px)`;
  });
})();

// tally numbers count up once, when scrolled into view
(function tally() {
  const nums = [...document.querySelectorAll('.tally [data-n]')];
  if (!nums.length) return;
  let done = false;
  const run = () => {
    if (done) return;
    const t = document.querySelector('.tally').getBoundingClientRect();
    if (t.top > innerHeight || t.bottom < 0) return;
    done = true;
    const t0 = performance.now();
    (function step(now) {
      const k = Math.min(1, (now - t0) / 1300);
      nums.forEach(s => { s.textContent = Math.round(+s.dataset.n * (1 - Math.pow(1 - k, 3))); });
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  };
  addEventListener('scroll', run, {passive: true});
  setTimeout(run, 800);
})();
document.documentElement.classList.add('js');
// reading progress hairline
const prog = document.getElementById('progress');
if (prog) addEventListener('scroll', () => {
  const h = document.documentElement;
  const k = h.scrollHeight - innerHeight;
  prog.style.width = (k > 0 ? (scrollY / k * 100) : 0) + '%';
}, {passive: true});

const RV = '.note-card,.gallery figure,.polaroid,.terminal-big,.cover-fig,.tally,details.faq,.band p,.check li,.bench li';
const revealCheck = () => document.querySelectorAll('.rv:not(.in)').forEach(el => {
  const b = el.getBoundingClientRect();
  if (b.top < innerHeight * .92 && b.bottom > 0) el.classList.add('in');
});
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), {threshold: .1});
  document.querySelectorAll(RV).forEach(el => { el.classList.add('rv'); io.observe(el); });
} else {
  document.querySelectorAll(RV).forEach(el => el.classList.add('rv'));
}
addEventListener('scroll', revealCheck, {passive: true});
addEventListener('resize', revealCheck);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(revealCheck);
revealCheck();
setTimeout(revealCheck, 600);

// image protection: no right-click save, no drag-out (images only, page stays usable)
document.querySelectorAll('.gallery img,.polaroid img,.hero-img,#lightbox img').forEach(i => {
  i.setAttribute('draggable', 'false');
});
document.addEventListener('contextmenu', e => { if (e.target.closest && e.target.closest('img,canvas')) e.preventDefault(); });
document.addEventListener('dragstart', e => { if (e.target.closest && e.target.closest('img')) e.preventDefault(); });

// render photos to canvas (stills only — gifs keep playing)
document.querySelectorAll('.gallery img,.polaroid img,.hero-img').forEach(img => {
  if (/\.gif(\?|#|$)/i.test(img.src)) return;
  const paint = () => {
    if (!img.naturalWidth || !img.isConnected) return;
    const h = Math.round(parseFloat(getComputedStyle(img).height)) || 200;
    const w = Math.max(2, Math.round(img.getBoundingClientRect().width)) || Math.round(h * 16 / 9);
    const cv = document.createElement('canvas');
    cv.width = Math.min(w * 2, 1600); cv.height = Math.max(2, Math.round(cv.width * h / w));
    const c = cv.getContext('2d');
    const s = Math.max(cv.width / img.naturalWidth, cv.height / img.naturalHeight);
    const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    c.drawImage(img, (cv.width - dw) / 2, (cv.height - dh) / 2, dw, dh);
    cv.dataset.src = img.src;
    img.replaceWith(cv);
  };
  if (img.complete && img.naturalWidth) paint();
  else img.addEventListener('load', paint);
});

// 100% checklist with memory
const boxes = [...document.querySelectorAll('.check input')];
const counter = document.getElementById('checkCount');
const paintCount = () => { if (counter) counter.textContent = boxes.filter(b => b.checked).length + '/' + boxes.length + ' inked'; };
boxes.forEach(b => {
  try { b.checked = localStorage.getItem('inkborn-' + b.dataset.k) === '1'; } catch (e) {}
  b.addEventListener('change', () => {
    try { localStorage.setItem('inkborn-' + b.dataset.k, b.checked ? '1' : '0'); } catch (e) {}
    paintCount();
  });
});
paintCount();
const lb = document.getElementById('lightbox');
if (lb) {
  const lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.cap');
  document.querySelectorAll('.gallery figure').forEach(f => {
    f.style.cursor = 'zoom-in';
    f.addEventListener('click', () => {
      const cap = f.querySelector('figcaption');
      const cv = f.querySelector('canvas'), im = f.querySelector('img');
      lbImg.src = cv ? cv.dataset.src : (im ? im.src : '');
      lbCap.textContent = cap ? cap.textContent : '';
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
  const closeLb = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
  lb.addEventListener('click', closeLb);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
}
