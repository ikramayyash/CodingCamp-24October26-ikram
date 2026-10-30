/* ============================================================
   Life Dashboard — script.js
   Pure Vanilla JS, no external libraries.
   All data persisted via the browser Local Storage API.
   ============================================================ */

/* ── 1. CONSTANTS & STORAGE KEYS ────────────────────────────── */

const STORAGE = {
  theme: 'dashboard_theme',
  name:  'dashboard_name',
  tasks: 'dashboard_tasks',
  links: 'dashboard_links',
};

const TIMER_DURATION = 25 * 60; // 25 minutes in seconds

/* ── 2. THEME MODULE ─────────────────────────────────────────── */

/**
 * Read saved theme from Local Storage and apply it to <html>.
 * Called first to avoid a flash of the wrong theme.
 */
function loadTheme() {
  const saved = localStorage.getItem(STORAGE.theme) || 'light';
  applyTheme(saved);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☾' : '☀';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(STORAGE.theme, next);
  applyTheme(next);
}

/* ── 3. GREETING MODULE ──────────────────────────────────────── */

const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

/** Update the clock, date, and greeting text every second. */
function updateClock() {
  const now    = new Date();
  const h      = now.getHours();
  const m      = now.getMinutes();
  const s      = now.getSeconds();

  // Time display (HH:MM:SS)
  const timeStr = [
    String(h).padStart(2, '0'),
    String(m).padStart(2, '0'),
    String(s).padStart(2, '0'),
  ].join(':');
  document.getElementById('greeting-time').textContent = timeStr;

  // Date display
  const day   = DAYS[now.getDay()];
  const date  = now.getDate();
  const month = MONTHS[now.getMonth()];
  const year  = now.getFullYear();
  document.getElementById('greeting-date').textContent = `${day}, ${date} ${month} ${year}`;

  // Greeting text
  let greeting;
  if (h >= 0  && h < 12) greeting = 'Good morning';
  else if (h >= 12 && h < 18) greeting = 'Good afternoon';
  else greeting = 'Good evening';

  const name = localStorage.getItem(STORAGE.name) || '';
  const nameStr = name ? `, ${name}` : '!';
  const suffix  = name ? '!' : '';
  document.getElementById('greeting-text').textContent = greeting + nameStr + suffix;
}

/** Load the stored name and show it in the greeting area. */
function loadName() {
  const name = localStorage.getItem(STORAGE.name) || '';
  const displayEl = document.getElementById('display-name');
  if (displayEl) {
    displayEl.textContent = name ? name : '';
  }
  updateClock(); // refresh greeting immediately
}

/** Wire up the name edit/save buttons. */
function initNameEditor() {
  const editBtn   = document.getElementById('edit-name-btn');
  const saveBtn   = document.getElementById('save-name-btn');
  const nameInput = document.getElementById('name-input');
  const displayEl = document.getElementById('display-name');

  // Show the input
  editBtn.addEventListener('click', () => {
    nameInput.value = localStorage.getItem(STORAGE.name) || '';
    nameInput.classList.remove('hidden');
    saveBtn.classList.remove('hidden');
    editBtn.classList.add('hidden');
    nameInput.focus();
  });

  // Save and hide the input
  function saveName() {
    const val = nameInput.value.trim();
    if (val) {
      localStorage.setItem(STORAGE.name, val);
      displayEl.textContent = val;
    } else {
      localStorage.removeItem(STORAGE.name);
      displayEl.textContent = '';
    }
    nameInput.classList.add('hidden');
    saveBtn.classList.add('hidden');
    editBtn.classList.remove('hidden');
    updateClock();
  }

  saveBtn.addEventListener('click', saveName);
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveName();
    if (e.key === 'Escape') {
      nameInput.classList.add('hidden');
      saveBtn.classList.add('hidden');
      editBtn.classList.remove('hidden');
    }
  });
}

/* ── 4. FOCUS TIMER MODULE ───────────────────────────────────── */

let timerRemaining = TIMER_DURATION;
let timerIntervalId = null;
let timerRunning = false;

/** Format seconds as MM:SS string. */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

/** Update the timer display element. */
function renderTimer() {
  const display = document.getElementById('timer-display');
  display.textContent = formatTime(timerRemaining);
  // Add/remove "done" pulsing style
  if (timerRemaining === 0) {
    display.classList.add('done');
  } else {
    display.classList.remove('done');
  }
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerIntervalId = setInterval(() => {
    timerRemaining--;
    renderTimer();
    if (timerRemaining <= 0) {
      stopTimer();
      showTimerAlert();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerIntervalId);
  timerIntervalId = null;
  timerRunning = false;
}

function resetTimer() {
  stopTimer();
  timerRemaining = TIMER_DURATION;
  renderTimer();
}

function showTimerAlert() {
  // Use a non-blocking banner for better UX
  const display = document.getElementById('timer-display');
  display.classList.add('done');
  // Brief browser notification via title flash, plus a simple alert after a tick
  setTimeout(() => alert('⏰ Focus session complete! Time for a break.'), 50);
}

function initTimer() {
  document.getElementById('timer-start').addEventListener('click', startTimer);
  document.getElementById('timer-stop').addEventListener('click', stopTimer);
  document.getElementById('timer-reset').addEventListener('click', resetTimer);
  renderTimer();
}

/* ── 5. TO-DO LIST MODULE ────────────────────────────────────── */

let tasks = [];

/** Load tasks from Local Storage and render. */
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE.tasks);
    tasks = raw ? JSON.parse(raw) : [];
  } catch (e) {
    tasks = [];
  }
  renderTasks();
}

/** Persist current tasks array to Local Storage. */
function saveTasks() {
  localStorage.setItem(STORAGE.tasks, JSON.stringify(tasks));
}

/** Show or clear inline error message. */
function setTaskError(msg) {
  const el = document.getElementById('task-error');
  el.textContent = msg;
  if (msg) {
    // Auto-clear after 3 seconds
    clearTimeout(el._clearTimer);
    el._clearTimer = setTimeout(() => { el.textContent = ''; }, 3000);
  }
}

/**
 * Add a new task.
 * Rejects empty strings and case-insensitive duplicates.
 */
function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    setTaskError('Task cannot be empty.');
    return;
  }
  // Duplicate check (case-insensitive)
  const lower = trimmed.toLowerCase();
  const duplicate = tasks.some(t => t.text.toLowerCase() === lower);
  if (duplicate) {
    setTaskError(`"${trimmed}" already exists in your list.`);
    return;
  }
  setTaskError('');
  tasks.push({ id: Date.now().toString(), text: trimmed, done: false });
  saveTasks();
  renderTasks();
  document.getElementById('task-input').value = '';
}

/** Toggle a task's done state. */
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks();
    renderTasks();
  }
}

/** Delete a task by id. */
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

/**
 * Switch a task's text span into an editable input.
 * Validates on confirm (Enter / blur).
 */
function editTask(id) {
  const li = document.querySelector(`[data-task-id="${id}"]`);
  if (!li) return;

  const task     = tasks.find(t => t.id === id);
  const textSpan = li.querySelector('.task-text');
  const editBtn  = li.querySelector('.edit-btn');

  // Replace span with input
  const input = document.createElement('input');
  input.type  = 'text';
  input.value = task.text;
  input.className = 'task-edit-input';
  input.maxLength = 200;
  textSpan.replaceWith(input);
  editBtn.disabled = true;
  input.focus();
  input.select();

  function confirmEdit() {
    const newText = input.value.trim();
    if (!newText) {
      input.focus();
      return;
    }
    // Duplicate check (exclude self)
    const lower = newText.toLowerCase();
    const dupe = tasks.some(t => t.id !== id && t.text.toLowerCase() === lower);
    if (dupe) {
      setTaskError(`"${newText}" already exists.`);
      input.focus();
      return;
    }
    setTaskError('');
    task.text = newText;
    saveTasks();
    renderTasks();
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')  confirmEdit();
    if (e.key === 'Escape') renderTasks(); // cancel
  });
  input.addEventListener('blur', confirmEdit);
}

/** Rebuild the full task list in the DOM. */
function renderTasks() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  if (tasks.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'task-empty';
    empty.style.cssText = 'color:var(--text-muted);font-size:0.9rem;padding:0.5rem 0;text-align:center;';
    empty.textContent = 'No tasks yet — add one above!';
    list.appendChild(empty);
    return;
  }

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' completed' : '');
    li.dataset.taskId = task.id;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type    = 'checkbox';
    checkbox.checked = task.done;
    checkbox.className = 'task-checkbox';
    checkbox.setAttribute('aria-label', `Mark "${task.text}" as ${task.done ? 'incomplete' : 'complete'}`);
    checkbox.addEventListener('change', () => toggleTask(task.id));

    // Text span
    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'task-btn edit-btn';
    editBtn.textContent = '✏';
    editBtn.setAttribute('aria-label', `Edit "${task.text}"`);
    editBtn.addEventListener('click', () => editTask(task.id));

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-btn delete';
    deleteBtn.textContent = '×';
    deleteBtn.setAttribute('aria-label', `Delete "${task.text}"`);
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

function initTodo() {
  const addBtn   = document.getElementById('task-add-btn');
  const taskInput = document.getElementById('task-input');

  addBtn.addEventListener('click', () => addTask(taskInput.value));
  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask(taskInput.value);
  });

  loadTasks();
}

/* ── 6. QUICK LINKS MODULE ───────────────────────────────────── */

let links = [];

/** Load links from Local Storage and render. */
function loadLinks() {
  try {
    const raw = localStorage.getItem(STORAGE.links);
    links = raw ? JSON.parse(raw) : [];
  } catch (e) {
    links = [];
  }
  renderLinks();
}

/** Persist current links array to Local Storage. */
function saveLinks() {
  localStorage.setItem(STORAGE.links, JSON.stringify(links));
}

/**
 * Add a new quick link.
 * Auto-prepends https:// if no protocol present.
 */
function addLink(label, url) {
  const trimLabel = label.trim();
  const trimUrl   = url.trim();

  if (!trimLabel || !trimUrl) return;

  // Ensure a protocol exists
  let finalUrl = trimUrl;
  if (!/^https?:\/\//i.test(finalUrl)) {
    finalUrl = 'https://' + finalUrl;
  }

  links.push({ id: Date.now().toString(), label: trimLabel, url: finalUrl });
  saveLinks();
  renderLinks();

  // Clear inputs
  document.getElementById('link-label-input').value = '';
  document.getElementById('link-url-input').value   = '';
}

/** Remove a link by id. */
function removeLink(id) {
  links = links.filter(l => l.id !== id);
  saveLinks();
  renderLinks();
}

/** Rebuild the links container. */
function renderLinks() {
  const container = document.getElementById('links-container');
  container.innerHTML = '';

  if (links.length === 0) {
    const empty = document.createElement('p');
    empty.style.cssText = 'color:var(--text-muted);font-size:0.9rem;';
    empty.textContent = 'No links yet — add one above!';
    container.appendChild(empty);
    return;
  }

  links.forEach(link => {
    // Outer wrapper
    const chip = document.createElement('div');
    chip.className = 'link-chip-wrapper';
    chip.style.cssText = 'display:inline-flex;align-items:center;';

    // Anchor
    const a = document.createElement('a');
    a.href   = link.url;
    a.target = '_blank';
    a.rel    = 'noopener noreferrer';
    a.className = 'link-chip';
    a.setAttribute('aria-label', `Open ${link.label}`);

    const labelSpan = document.createElement('span');
    labelSpan.textContent = link.label;
    a.appendChild(labelSpan);

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'chip-remove';
    removeBtn.textContent = '×';
    removeBtn.setAttribute('aria-label', `Remove ${link.label}`);
    removeBtn.addEventListener('click', (e) => {
      e.preventDefault(); // don't follow the link
      removeLink(link.id);
    });

    a.appendChild(removeBtn);
    chip.appendChild(a);
    container.appendChild(chip);
  });
}

function initLinks() {
  const addBtn    = document.getElementById('link-add-btn');
  const labelInput = document.getElementById('link-label-input');
  const urlInput  = document.getElementById('link-url-input');

  addBtn.addEventListener('click', () => addLink(labelInput.value, urlInput.value));

  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addLink(labelInput.value, urlInput.value);
  });
  labelInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') urlInput.focus();
  });

  loadLinks();
}

/* ── 7. INIT ─────────────────────────────────────────────────── */

/**
 * Bootstrap function — called once the DOM is ready.
 * Order matters: theme must be applied first to avoid flash.
 */
function init() {
  // 1. Apply theme before anything renders
  loadTheme();

  // 2. Wire theme toggle
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // 3. Greeting clock
  loadName();
  initNameEditor();
  updateClock();
  setInterval(updateClock, 1000);

  // 4. Focus timer
  initTimer();

  // 5. To-Do list
  initTodo();

  // 6. Quick links
  initLinks();
}

// Run init after DOM is fully parsed
document.addEventListener('DOMContentLoaded', init);
