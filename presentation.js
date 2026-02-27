/* ============================================================
   PRESENTATION.JS  — updated
   Navigation + reveal engine for Casey's classroom presentations.
   ============================================================ */

// ── Public helper functions ────────────────────────────────
function vis(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('vis');
}

function act(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('act');
}

function visAns(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('vis');
  el.style.opacity = '1';
  el.style.transform = 'scale(1)';
}

function stagger(ids, delayMs = 120) {
  ids.forEach((id, i) => setTimeout(() => vis(id), i * delayMs));
}

// ── Internal engine ────────────────────────────────────────
let _scenes, _current = 0, _stepIdx = 0, _transitioning = false;

function _fullReveal(idx) {
  const el = document.getElementById(_scenes[idx].id);
  el.querySelectorAll('.reveal').forEach(e => e.classList.add('vis'));
  el.querySelectorAll('.pow-ans').forEach(e => e.classList.add('vis'));
  el.querySelectorAll('.conf-item').forEach(e => e.classList.add('vis'));
  el.querySelectorAll('.we-answer').forEach(e => {
    e.classList.add('vis');
    e.style.opacity = '1';
    e.style.transform = 'scale(1)';
  });
  el.querySelectorAll('.step-row').forEach(e => e.classList.add('act'));
  if (_scenes[idx].fullFn) _scenes[idx].fullFn();
}

function _resetScene(idx) {
  const el = document.getElementById(_scenes[idx].id);
  el.querySelectorAll('.vis').forEach(e => e.classList.remove('vis'));
  el.querySelectorAll('.act').forEach(e => e.classList.remove('act'));
  el.querySelectorAll('.we-answer').forEach(e => {
    e.style.opacity = '';
    e.style.transform = '';
  });
}

/* Update the active dot to pulse when steps remain; solid when the
   next click will advance to the next scene. */
function _updateStepIndicator() {
  const d = document.getElementById('pd' + _current);
  if (!d) return;
  const hasMore = _stepIdx < _scenes[_current].steps.length;
  d.classList.toggle('steps-remain', hasMore);
}

function _updateDots(n) {
  const leftEl  = document.getElementById('slide-num-l');
  const rightEl = document.getElementById('slide-num-r');
  if (leftEl)  leftEl.textContent  = String(n + 1).padStart(2, '0');
  if (rightEl) rightEl.textContent = String(_scenes.length).padStart(2, '0');

  _scenes.forEach((_, i) => {
    const d = document.getElementById('pd' + i);
    if (!d) return;
    d.className = 'prog-dot' +
      (i < n ? ' done' : '') +
      (i === n ? ' active' : '');
  });
}

function _goTo(n, forward) {
  if (n < 0 || n >= _scenes.length || _transitioning) return;
  _transitioning = true;

  document.getElementById(_scenes[_current].id).classList.remove('active');
  _resetScene(_current);

  _current = n;
  _stepIdx = 0;

  document.getElementById(_scenes[_current].id).classList.add('active');
  _updateDots(_current);

  setTimeout(() => {
    _transitioning = false;
    if (forward === false) {
      _fullReveal(_current);
      _stepIdx = _scenes[_current].steps.length;
      _updateStepIndicator();
    } else {
      _runStep();
    }
  }, 150);
}

function _runStep() {
  const steps = _scenes[_current].steps;
  if (_stepIdx < steps.length) {
    steps[_stepIdx]();
    _stepIdx++;
    _updateStepIndicator();
  }
}

function _advance() {
  if (_transitioning) return;
  if (_stepIdx < _scenes[_current].steps.length) {
    _runStep();
  } else if (_current + 1 < _scenes.length) {
    _goTo(_current + 1, true);
  }
}

function _goBack() {
  if (_current > 0) _goTo(_current - 1, false);
}

// ── Init (called by each lesson HTML) ─────────────────────
function initPresentation(scenes) {
  _scenes = scenes;

  const prog = document.getElementById('progress');

  // Left slide number
  const leftNum = document.createElement('span');
  leftNum.id = 'slide-num-l';
  leftNum.className = 'slide-num';
  prog.appendChild(leftNum);

  // Progress dots
  scenes.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'prog-dot';
    d.id = 'pd' + i;
    prog.appendChild(d);
  });

  // Right slide number (total)
  const rightNum = document.createElement('span');
  rightNum.id = 'slide-num-r';
  rightNum.className = 'slide-num';
  prog.appendChild(rightNum);

  document.addEventListener('click', _advance);
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' || e.code === 'ArrowRight') { e.preventDefault(); _advance(); }
    if (e.code === 'ArrowLeft') { e.preventDefault(); _goBack(); }
  });

  _updateDots(0);
  document.getElementById(_scenes[0].id).classList.add('active');
  setTimeout(() => _runStep(), 300);
}