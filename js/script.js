const STORAGE = {
  theme: 'dashboard_theme',
  name:  'dashboard_name',
  tasks: 'dashboard_tasks',
  links: 'dashboard_links',
};

const TIMER_DURATION = 25 * 60; 
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


const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

function updateClock() {
  const now    = new Date();
  const h      = now.getHours();
  const m      = now.getMinutes();
  const s      = now.getSeconds();

  const timeStr = [
    String(h).padStart(2, '0'),
    String(m).padStart(2, '0'),
    String(s).padStart(2, '0'),
  ].join(':');
  document.getElementById('greeting-time').textContent = timeStr;

  const day   = DAYS[now.getDay()];
  const date  = now.getDate();
  const month = MONTHS[now.getMonth()];
  const year  = now.getFullYear();
  document.getElementById('greeting-date').textContent = `${day}, ${date} ${month} ${year}`;

  let greeting;
  if (h >= 0  && h < 12) greeting = 'Good morning';
  else if (h >= 12 && h < 18) greeting = 'Good afternoon';
  else greeting = 'Good evening';

  const name = localStorage.getItem(STORAGE.name) || '';
  const nameStr = name ? `, ${name}` : '!';
  const suffix  = name ? '!' : '';
  document.getElementById('greeting-text').textContent = greeting + nameStr + suffix;
}

function loadName() {
  const name = localStorage.getItem(STORAGE.name) || '';
  const displayEl = document.getElementById('display-name');
  if (displayEl) {
    displayEl.textContent = name ? name : '';
  }
  updateClock(); 
}

function initNameEditor() {
  const editBtn   = document.getElementById('edit-name-btn');
  const saveBtn   = document.getElementById('save-name-btn');
  const nameInput = document.getElementById('name-input');
  const displayEl = document.getElementById('display-name');

  editBtn.addEventListener('click', () => {
    nameInput.value = localStorage.getItem(STORAGE.name) || '';
    nameInput.classList.remove('hidden');
    saveBtn.classList.remove('hidden');
    editBtn.classList.add('hidden');
    nameInput.focus();
  });

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


let timerRemaining = TIMER_DURATION;
let timerIntervalId = null;
let timerRunning = false;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function renderTimer() {
  const display = document.getElementById('timer-display');
  display.textContent = formatTime(timerRemaining);
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
  const display = document.getElementById('timer-display');
  display.classList.add('done');
  setTimeout(() => alert('⏰ Focus session complete! Time for a break.'), 50);
}

function initTimer() {
  document.getElementById('timer-start').addEventListener('click', startTimer);
  document.getElementById('timer-stop').addEventListener('click', stopTimer);
  document.getElementById('timer-reset').addEventListener('click', resetTimer);
  renderTimer();
}


let tasks = [];

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE.tasks);
    tasks = raw ? JSON.parse(raw) : [];
  } catch (e) {
    tasks = [];
  }
  renderTasks();
}

function saveTasks() {
  localStorage.setItem(STORAGE.tasks, JSON.stringify(tasks));
}

function setTaskError(msg) {
  const el = document.getElementById('task-error');
  el.textContent = msg;
  if (msg) {
    clearTimeout(el._clearTimer);
    el._clearTimer = setTimeout(() => { el.textContent = ''; }, 3000);
  }
}

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    setTaskError('Task cannot be empty.');
    return;
  }
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

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function editTask(id) {
  const li = document.querySelector(`[data-task-id="${id}"]`);
  if (!li) return;

  const task     = tasks.find(t => t.id === id);
  const textSpan = li.querySelector('.task-text');
  const editBtn  = li.querySelector('.edit-btn');

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
    if (e.key === 'Escape') renderTasks(); 
  });
  input.addEventListener('blur', confirmEdit);
}

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

    const checkbox = document.createElement('input');
    checkbox.type    = 'checkbox';
    checkbox.checked = task.done;
    checkbox.className = 'task-checkbox';
    checkbox.setAttribute('aria-label', `Mark "${task.text}" as ${task.done ? 'incomplete' : 'complete'}`);
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;

    const editBtn = document.createElement('button');
    editBtn.className = 'task-btn edit-btn';
    editBtn.textContent = '✏';
    editBtn.setAttribute('aria-label', `Edit "${task.text}"`);
    editBtn.addEventListener('click', () => editTask(task.id));

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

let links = [];

function loadLinks() {
  try {
    const raw = localStorage.getItem(STORAGE.links);
    links = raw ? JSON.parse(raw) : [];
  } catch (e) {
    links = [];
  }
  renderLinks();
}

function saveLinks() {
  localStorage.setItem(STORAGE.links, JSON.stringify(links));
}

function addLink(label, url) {
  const trimLabel = label.trim();
  const trimUrl   = url.trim();

  if (!trimLabel || !trimUrl) return;

  let finalUrl = trimUrl;
  if (!/^https?:\/\//i.test(finalUrl)) {
    finalUrl = 'https://' + finalUrl;
  }

  links.push({ id: Date.now().toString(), label: trimLabel, url: finalUrl });
  saveLinks();
  renderLinks();

  document.getElementById('link-label-input').value = '';
  document.getElementById('link-url-input').value   = '';
}

function removeLink(id) {
  links = links.filter(l => l.id !== id);
  saveLinks();
  renderLinks();
}

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
    const chip = document.createElement('div');
    chip.className = 'link-chip-wrapper';
    chip.style.cssText = 'display:inline-flex;align-items:center;';

    const a = document.createElement('a');
    a.href   = link.url;
    a.target = '_blank';
    a.rel    = 'noopener noreferrer';
    a.className = 'link-chip';
    a.setAttribute('aria-label', `Open ${link.label}`);

    const labelSpan = document.createElement('span');
    labelSpan.textContent = link.label;
    a.appendChild(labelSpan);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'chip-remove';
    removeBtn.textContent = '×';
    removeBtn.setAttribute('aria-label', `Remove ${link.label}`);
    removeBtn.addEventListener('click', (e) => {
      e.preventDefault();
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

function init() {
  loadTheme();

  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  loadName();
  initNameEditor();
  updateClock();
  setInterval(updateClock, 1000);

  initTimer();

  initTodo();

  initLinks();
}

document.addEventListener('DOMContentLoaded', init);
