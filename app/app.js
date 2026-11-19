'use strict';

const STORAGE_KEY = 'gta6-trophy-guide-v1';
const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
const KIND_LABEL = {
  platinum: 'Platinum',
  story: 'Story',
  side: 'Side characters & strangers',
  collectible: 'Collectible',
  activity: 'Activity',
  combat: 'Combat & robbery',
  exploration: 'Exploration',
  money: 'Money',
  vague: 'Story moment (unconfirmed)',
  completion: '100% completion',
};

let DATA = null;
let earned = new Set();
let spoilerMode = false;
let demoEarned = null; // in-memory demo checks for screenshots; never saved

function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n) => Number.isInteger(n)));
  } catch (_) {
    return new Set();
  }
}

function saveEarned() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch (_) {
    // storage full or unavailable: the page still works for this session
  }
}

function gradeBadge(grade) {
  return '<span class="grade grade-' + grade + '">' + grade + '</span>';
}

function trophyCard(t) {
  const isEarned = earned.has(t.id);
  const hidden = spoilerMode && t.hidden && !isEarned;
  const name = hidden ? 'Hidden story trophy' : escapeHtml(t.name);
  const desc = hidden ? 'This trophy is hidden on PlayStation until you earn it. Tick it off when it pops.' : escapeHtml(t.description);
  const missable = t.missable
    ? '<span class="flag flag-missable" title="Can be missed — see the guide">MISSABLE</span>'
    : '';
  const unconfirmed = /No confirmed/.test(t.guide)
    ? '<span class="flag flag-unconfirmed">Method unconfirmed at launch</span>'
    : '';
  const sources = t.sources.map((s) => '<span class="source">' + escapeHtml(s) + '</span>').join('');
  const stageText = DATA.roadmap.find((s) => s.stage === t.stage)
    ? 'Roadmap stage ' + t.stage
    : '';
  return (
    '<article class="trophy' + (isEarned ? ' earned' : '') + '" id="trophy-' + t.id + '" data-kind="' + t.kind + '" data-grade="' + t.grade + '">' +
    '<label class="trophy-check"><input type="checkbox" data-id="' + t.id + '"' + (isEarned ? ' checked' : '') + ' aria-label="Mark ' + name + ' as earned"><span class="box" aria-hidden="true"></span></label>' +
    '<div class="trophy-body">' +
    '<div class="trophy-top"><h3>' + name + '</h3>' + gradeBadge(t.grade) + missable + unconfirmed + '</div>' +
    '<p class="trophy-desc">' + desc + '</p>' +
    '<p class="trophy-meta"><span class="kind">' + KIND_LABEL[t.kind] + '</span><span class="stage">' + stageText + '</span></p>' +
    '<details class="guide"><summary>Read the guide</summary><p>' + escapeHtml(t.guide) + '</p><p class="guide-sources">Sources: ' + sources + '</p></details>' +
    '</div></article>'
  );
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderRoadmap() {
  const list = document.getElementById('roadmapList');
  list.innerHTML = DATA.roadmap
    .map((s) => {
      const done = s.trophies.filter((id) => earned.has(id)).length;
      return (
        '<li class="stage-card">' +
        '<div class="stage-head"><span class="stage-num">Stage ' + s.stage + '</span><span class="stage-progress">' + done + ' / ' + s.trophies.length + '</span></div>' +
        '<h3>' + escapeHtml(s.title) + '</h3>' +
        '<p>' + escapeHtml(s.text) + '</p>' +
        '<p class="stage-links">' +
        s.trophies
          .map((id) => {
            const t = DATA.trophies.find((x) => x.id === id);
            return '<a href="#trophy-' + id + '" class="stage-link' + (earned.has(id) ? ' done' : '') + '">' + (t ? escapeHtml(t.name) : id) + '</a>';
          })
          .join('') +
        '</p></li>'
      );
    })
    .join('');
}

function visibleTrophies() {
  const q = document.getElementById('search').value.trim().toLowerCase();
  const kind = document.getElementById('kindFilter').value;
  const grade = document.getElementById('gradeFilter').value;
  const missableOnly = document.getElementById('missableOnly').checked;
  const hideEarned = document.getElementById('hideEarned').checked;
  return DATA.trophies.filter((t) => {
    if (kind && t.kind !== kind) return false;
    if (grade && t.grade !== grade) return false;
    if (missableOnly && !t.missable) return false;
    if (hideEarned && earned.has(t.id)) return false;
    if (q) {
      const hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderList() {
  const list = visibleTrophies();
  document.getElementById('trophyList').innerHTML = list.map(trophyCard).join('');
  document.getElementById('emptyState').hidden = list.length > 0;
  document.getElementById('listCount').textContent =
    list.length + ' of 55 trophies shown · ' + earned.size + ' earned';
}

function renderProgress() {
  const total = DATA.trophies.length;
  const pct = Math.round((earned.size / total) * 100);
  document.getElementById('progressText').textContent = earned.size + ' / ' + total + ' earned';
  document.getElementById('progressPct').textContent = pct + '%';
  document.getElementById('progressFill').style.width = pct + '%';
  const platinum = earned.size === total;
  document.getElementById('progressNote').textContent = platinum
    ? 'Platinum earned — you are a Leonida Legend.'
    : 'Earn the other ' + (total - earned.size) + ' and the platinum is yours.';
}

function renderAll() {
  renderProgress();
  renderRoadmap();
  renderList();
}

function onToggle(id, checked) {
  if (checked) earned.add(id);
  else earned.delete(id);
  saveEarned();
  renderAll();
}

function exportProgress() {
  const blob = new Blob(
    [JSON.stringify({ app: 'gta6-trophy-guide', version: 1, earned: [...earned].sort((a, b) => a - b) }, null, 2)],
    { type: 'application/json' }
  );
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const ids = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(ids)) throw new Error('bad file');
      const valid = new Set(DATA.trophies.map((t) => t.id));
      earned = new Set(ids.filter((n) => valid.has(n)));
      saveEarned();
      renderAll();
    } catch (_) {
      alert('That file does not look like a progress export from this guide.');
    }
  };
  reader.readAsText(file);
}

function applyUrlParams() {
  const params = new URLSearchParams(location.search);
  if (params.get('spoiler') === '1') {
    spoilerMode = true;
    document.getElementById('spoilerToggle').checked = true;
  }
  if (params.get('demo') === '1') {
    // Demo state for screenshots only: checks a few trophies in memory,
    // never written to localStorage. No platinum — that only pops last.
    demoEarned = new Set([2, 3, 8, 28, 35]);
    demoEarned.forEach((id) => earned.add(id));
  }
  if (params.get('filter') === 'missable') {
    document.getElementById('missableOnly').checked = true;
  }
  if (params.get('view') === 'spoiler') {
    spoilerMode = true;
    document.getElementById('spoilerToggle').checked = true;
  }
  renderAll();
  // Open the requested guide AFTER the final render: rendering rebuilds
  // the list, so opening before it would be wiped out.
  const openId = Number(params.get('open'));
  if (openId && DATA.trophies.some((t) => t.id === openId)) {
    const el = document.getElementById('trophy-' + openId);
    const details = el ? el.querySelector('details.guide') : null;
    if (details) details.open = true;
  }
}

async function init() {
  const res = await fetch('data/trophies.json');
  DATA = await res.json();
  DATA.trophies.sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.id - b.id);
  earned = loadEarned();
  renderAll();
  // URL params run after the first render: ?open= needs the list in the DOM.
  applyUrlParams();

  document.getElementById('trophyList').addEventListener('change', (e) => {
    const input = e.target.closest('input[type="checkbox"][data-id]');
    if (input) onToggle(Number(input.dataset.id), input.checked);
  });
  ['search', 'kindFilter', 'gradeFilter', 'missableOnly', 'hideEarned'].forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener('input', renderList);
    el.addEventListener('change', renderList); // selects fire change, not input
  });
  document.getElementById('spoilerToggle').addEventListener('change', (e) => {
    spoilerMode = e.target.checked;
    renderList();
  });
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', (e) => {
    if (e.target.files[0]) importProgress(e.target.files[0]);
    e.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Clear all earned trophies? This cannot be undone.')) {
      earned = new Set();
      saveEarned();
      renderAll();
    }
  });
  document.getElementById('jumpMissable').addEventListener('click', () => {
    document.getElementById('missableOnly').checked = true;
    renderList();
    document.getElementById('trophy-28').scrollIntoView({ block: 'center' });
    const details = document.querySelector('#trophy-28 details.guide');
    if (details) details.open = true;
  });
}

init();
