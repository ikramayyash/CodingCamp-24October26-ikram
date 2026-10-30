# Design: To-Do List Life Dashboard

## File Structure

```
life-dashboard/
├── index.html          ← single HTML entry point
├── css/
│   └── style.css       ← all styling, CSS custom properties for theming
└── js/
    └── script.js       ← all logic, no external dependencies
```

---

## HTML Structure (`index.html`)

```html
<html data-theme="light">  ← theme attribute toggled by JS
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Life Dashboard</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <header class="topbar">
    <h1 class="app-title">Life Dashboard</h1>
    <button id="theme-toggle" aria-label="Toggle theme">☀</button>
  </header>

  <main class="dashboard">

    <!-- Greeting Card -->
    <section class="card greeting-card" id="greeting-section">
      <p id="greeting-time">--:--</p>
      <p id="greeting-date">---</p>
      <p id="greeting-text">Good morning!</p>
      <div class="name-editor">
        <span id="display-name"></span>
        <button id="edit-name-btn">✏</button>
        <input id="name-input" type="text" placeholder="Your name" hidden />
        <button id="save-name-btn" hidden>Save</button>
      </div>
    </section>

    <!-- Grid Row: Timer + Tasks -->
    <div class="grid-row">

      <!-- Focus Timer Card -->
      <section class="card timer-card" id="timer-section">
        <h2>Focus Timer</h2>
        <div class="timer-display" id="timer-display">25:00</div>
        <div class="timer-controls">
          <button id="timer-start">Start</button>
          <button id="timer-stop">Stop</button>
          <button id="timer-reset">Reset</button>
        </div>
      </section>

      <!-- To-Do List Card -->
      <section class="card todo-card" id="todo-section">
        <h2>Tasks</h2>
        <div class="todo-input-row">
          <input id="task-input" type="text" placeholder="Add a task…" />
          <button id="task-add-btn">Add</button>
        </div>
        <p class="error-msg" id="task-error" hidden></p>
        <ul id="task-list"></ul>
      </section>

    </div>

    <!-- Quick Links Card -->
    <section class="card links-card" id="links-section">
      <h2>Quick Links</h2>
      <div class="links-input-row">
        <input id="link-label-input" type="text" placeholder="Label" />
        <input id="link-url-input" type="url" placeholder="https://…" />
        <button id="link-add-btn">Add Link</button>
      </div>
      <div id="links-container"></div>
    </section>

  </main>

  <script src="js/script.js"></script>
</body>
</html>
```

---

## CSS Design (`css/style.css`)

### Theming via CSS Custom Properties

Two sets of variables declared on `[data-theme="light"]` and `[data-theme="dark"]`.

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#f0f2f5` | `#1a1a2e` |
| `--surface` | `#ffffff` | `#16213e` |
| `--surface-alt` | `#f8f9fa` | `#0f3460` |
| `--text-primary` | `#1a1a2e` | `#e0e0e0` |
| `--text-muted` | `#6c757d` | `#a0a0b0` |
| `--accent` | `#4361ee` | `#4cc9f0` |
| `--accent-hover` | `#3a52d4` | `#38b2d8` |
| `--danger` | `#e63946` | `#ff6b6b` |
| `--border` | `#dee2e6` | `#2a2a4a` |
| `--shadow` | `rgba(0,0,0,0.08)` | `rgba(0,0,0,0.4)` |

### Layout

- `body` — `min-height: 100vh`, `background: var(--bg)`, centered with `max-width: 1100px` + auto margins.
- `.dashboard` — CSS Grid, single column.
- `.grid-row` — `display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem;`
  - On screens < 700 px: `grid-template-columns: 1fr` (stacks vertically).
- `.card` — `background: var(--surface); border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 12px var(--shadow);`

### Typography

- Font stack: `'Segoe UI', system-ui, -apple-system, sans-serif`
- Base font size: `16px`
- Timer display: `font-size: 3.5rem; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: 0.05em`

### Component Styles

**Buttons** — rounded (`border-radius: 8px`), `background: var(--accent)`, white text, hover darkens.  
**Inputs** — full border, `border-radius: 8px`, `border: 1px solid var(--border)`, focus ring uses `--accent`.  
**Task item** — flex row: `[checkbox] [text] [edit btn] [delete btn]`. Completed items get `text-decoration: line-through; color: var(--text-muted)`.  
**Link chips** — pill shape (`border-radius: 999px`), accent background, × button inline.  
**Error message** — `color: var(--danger); font-size: 0.85rem`.  
**Theme toggle** — top-right, circular, icon-only.

---

## JavaScript Architecture (`js/script.js`)

Organised into clearly commented sections, all within a single IIFE or top-level module pattern (no `import/export` needed since there's only one file).

### Sections

1. **Constants & Storage Keys**
   ```js
   const STORAGE = {
     theme: 'dashboard_theme',
     name:  'dashboard_name',
     tasks: 'dashboard_tasks',
     links: 'dashboard_links',
   };
   const TIMER_DURATION = 25 * 60; // seconds
   ```

2. **Theme Module**
   - `loadTheme()` — read `STORAGE.theme`, apply `data-theme` attribute on `<html>`, set toggle icon.
   - `toggleTheme()` — flip theme, save to LS, update icon.

3. **Greeting Module**
   - `updateClock()` — called every second via `setInterval`. Updates `#greeting-time`, `#greeting-date`, `#greeting-text`.
   - `loadName()` — read `STORAGE.name`, populate `#display-name`.
   - `saveName()` — read input, validate non-empty, save, hide input.
   - Edit/Save button wiring.

4. **Timer Module**
   - State: `let remaining = TIMER_DURATION; let intervalId = null; let running = false;`
   - `renderTimer()` — format `remaining` as MM:SS, update `#timer-display`.
   - `startTimer()`, `stopTimer()`, `resetTimer()` — manage `intervalId`.
   - On tick: decrement `remaining`, call `renderTimer()`. At 0: stop, show alert.

5. **Todo Module**
   - State: `let tasks = []` (loaded from LS on init).
   - `loadTasks()` — parse LS JSON, call `renderTasks()`.
   - `saveTasks()` — JSON.stringify tasks array to LS.
   - `addTask(text)` — trim, validate non-empty, check duplicate (`.toLowerCase()`), push `{id, text, done}`, save, render.
   - `editTask(id)` — replace task `<li>` text with inline `<input>`, confirm on blur/Enter.
   - `toggleTask(id)` — flip `done`, save, render.
   - `deleteTask(id)` — filter out, save, render.
   - `renderTasks()` — clear `#task-list`, append `<li>` for each task.
   - ID generation: `Date.now().toString()`.

6. **Links Module**
   - State: `let links = []` (loaded from LS on init).
   - `loadLinks()`, `saveLinks()`, `addLink(label, url)`, `removeLink(id)`, `renderLinks()`.
   - `addLink` validates that both label and url are non-empty; basic URL check (starts with `http://` or `https://`, or prepend `https://` automatically).

7. **Init**
   - Call `loadTheme()`, `loadName()`, `loadTasks()`, `loadLinks()`, `updateClock()`.
   - Set up all event listeners.
   - Start clock interval.

---

## Local Storage Schema

| Key | Type | Example |
|---|---|---|
| `dashboard_theme` | string | `"dark"` |
| `dashboard_name` | string | `"Ikram"` |
| `dashboard_tasks` | JSON array | `[{"id":"1","text":"Buy milk","done":false}]` |
| `dashboard_links` | JSON array | `[{"id":"2","label":"GitHub","url":"https://github.com"}]` |

---

## Accessibility Notes

- All buttons have descriptive `aria-label` where icon-only.
- Inputs have associated labels or `placeholder` + `aria-label`.
- Focus visible outlines not removed (only restyled).
- Colour contrast meets WCAG AA in both themes.
