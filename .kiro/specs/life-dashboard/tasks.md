# Tasks: To-Do List Life Dashboard

## Task 1 · Scaffold `index.html`
- [x] Create `index.html` at the project root with correct `<!DOCTYPE html>` and `<html data-theme="light">`.
- [x] Add `<head>` with charset, viewport meta, title "Life Dashboard", and `<link>` to `css/style.css`.
- [x] Add `<header class="topbar">` containing the app title and theme toggle button.
- [x] Add `<main class="dashboard">` with all four section placeholders (greeting, grid-row with timer+todo, links) as per the design.
- [x] Place `<script src="js/script.js">` just before `</body>`.

## Task 2 · Build `css/style.css` — Theming & Base
- [x] Define CSS custom properties for light theme on `[data-theme="light"]` and dark theme on `[data-theme="dark"]` (all tokens from design).
- [x] Set global box-sizing, margin/padding reset, and font stack on `*` and `body`.
- [x] Style `body`: background `var(--bg)`, colour `var(--text-primary)`, transition for theme change.
- [x] Style `.topbar`: flex row, space-between, padding, border-bottom.
- [x] Style `.dashboard`: grid layout, gap, max-width, centered.
- [x] Style `.card`: surface background, border-radius, padding, box-shadow.

## Task 3 · Build `css/style.css` — Components
- [x] Style `.grid-row` as a two-column grid (timer 1fr, todo 2fr); single column on < 700 px.
- [x] Style all `button` elements: accent colour, rounded, hover state, cursor pointer.
- [x] Style all `input[type="text"]`, `input[type="url"]`: bordered, rounded, focus ring, full-width where appropriate.
- [x] Style `#theme-toggle`: circular, icon-only, positioned in topbar.
- [x] Style the timer display (`#timer-display`): large tabular-nums font.
- [x] Style task list (`#task-list`): no list-style, task items as flex rows with gap.
- [x] Style completed tasks: strikethrough, muted colour.
- [x] Style link chips: pill shape, accent background, white text, × button.
- [x] Style `.error-msg`: danger colour, small font.
- [x] Add smooth colour/background transitions for theme switching.

## Task 4 · Implement `js/script.js` — Theme Module
- [x] Define `STORAGE` constants object and `TIMER_DURATION`.
- [x] Implement `loadTheme()`: read LS, apply `data-theme` on `<html>`, set button icon (☀ / ☾).
- [x] Implement `toggleTheme()`: flip theme, persist, update icon.
- [x] Wire `#theme-toggle` click to `toggleTheme()`.
- [x] Call `loadTheme()` at the top of init (before DOM paint) to prevent theme flash.

## Task 5 · Implement `js/script.js` — Greeting Module
- [x] Implement `updateClock()`: format current time as HH:MM, date as "Weekday, DD Month YYYY", determine greeting by hour, update DOM elements, also refresh `data-theme` icon if needed.
- [x] Start a 1-second `setInterval` calling `updateClock()`.
- [x] Implement `loadName()`: read LS, display in `#display-name`.
- [x] Implement name edit flow: click `#edit-name-btn` → show `#name-input` + `#save-name-btn`, hide edit button. Click `#save-name-btn` → trim value, save to LS, update `#display-name`, toggle visibility back.

## Task 6 · Implement `js/script.js` — Focus Timer Module
- [x] Declare timer state: `remaining`, `intervalId`, `running`.
- [x] Implement `renderTimer()`: convert seconds to MM:SS string, set `#timer-display` text.
- [x] Implement `startTimer()`: if not already running, set `running = true`, start interval that decrements `remaining`, calls `renderTimer()`, and on zero stops and alerts.
- [x] Implement `stopTimer()`: clear interval, set `running = false`.
- [x] Implement `resetTimer()`: call `stopTimer()`, reset `remaining` to `TIMER_DURATION`, call `renderTimer()`.
- [x] Wire Start / Stop / Reset buttons.

## Task 7 · Implement `js/script.js` — To-Do List Module
- [x] Implement `loadTasks()`: parse LS JSON, set `tasks` array, call `renderTasks()`.
- [x] Implement `saveTasks()`: JSON.stringify `tasks` to LS.
- [x] Implement `addTask(text)`: trim, check empty (show error), check duplicate case-insensitive (show error), create task object `{id, text, done: false}`, push, save, render.
- [x] Implement `renderTasks()`: clear `#task-list`, build `<li>` per task with checkbox, text span, edit btn, delete btn.
- [x] Implement `toggleTask(id)`: find task, flip `done`, save, render.
- [x] Implement `editTask(id)`: replace text span with `<input>`, confirm on Enter or blur, validate non-empty + duplicate (excluding self), save, render.
- [x] Implement `deleteTask(id)`: filter, save, render.
- [x] Wire `#task-add-btn` click and `#task-input` Enter keydown to `addTask`.

## Task 8 · Implement `js/script.js` — Quick Links Module
- [x] Implement `loadLinks()`: parse LS JSON, set `links` array, call `renderLinks()`.
- [x] Implement `saveLinks()`: JSON.stringify `links` to LS.
- [x] Implement `addLink(label, url)`: trim, validate both fields, auto-prepend `https://` if no protocol, push `{id, label, url}`, save, render.
- [x] Implement `removeLink(id)`: filter, save, render.
- [x] Implement `renderLinks()`: clear `#links-container`, build chip elements, each opens URL in new tab.
- [x] Wire `#link-add-btn` click and Enter on URL input to `addLink`.

## Task 9 · Final Integration & Polish
- [x] Ensure `init()` function calls modules in correct order: `loadTheme()` first, then clock, then data modules.
- [x] Confirm all Local Storage keys match the schema in the design doc.
- [x] Test duplicate-task prevention works case-insensitively.
- [x] Verify timer resets correctly and fires alert at zero.
- [x] Check quick links open in `target="_blank"` with `rel="noopener noreferrer"`.
- [x] Verify theme persists on page reload.
- [x] Verify name persists on page reload.
- [x] Verify tasks and links persist on page reload.
- [x] Confirm responsive layout works on narrow viewport (< 700 px).
- [x] Add code comments to major sections in `script.js` and `style.css`.
