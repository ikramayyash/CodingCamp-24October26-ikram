# Requirements: To-Do List Life Dashboard

## Overview
A single-page, client-side Life Dashboard built with plain HTML, CSS, and Vanilla JavaScript.
No backend, no framework, no build tools. All state persists in browser Local Storage.

---

## Functional Requirements

### FR-1 · Greeting Card
- Display the user's current local **time** (HH:MM, updating every second) and full **date** (e.g. Friday, 30 October 2026).
- Show a time-of-day greeting:
  - 00:00–11:59 → "Good morning"
  - 12:00–17:59 → "Good afternoon"
  - 18:00–23:59 → "Good evening"
- Allow the user to set a **custom name** that appears in the greeting (e.g. "Good morning, Ikram!").
  - Name is editable via an inline input or edit button.
  - Name is saved in Local Storage under the key `dashboard_name`.
  - If no name is set, omit the name from the greeting.

### FR-2 · Focus Timer
- Default duration: **25 minutes** (1 500 seconds).
- Display remaining time as **MM:SS**.
- Three controls:
  - **Start** — begins or resumes the countdown.
  - **Stop / Pause** — pauses the countdown without resetting.
  - **Reset** — returns to 25:00 and stops.
- When the timer reaches 00:00, show a visual/audio alert (browser `alert()` or a styled banner) and stop automatically.
- Timer state does NOT need to survive page refreshes (in-memory only).

### FR-3 · To-Do List
- **Add** a task via a text input + "Add" button (or Enter key).
- **Edit** a task in-place (click an edit icon or double-click the task text).
- **Mark as done** — clicking a checkbox or the task text toggles a completed style (strikethrough + muted colour).
- **Delete** a task via a delete button (×).
- Tasks are stored in Local Storage under the key `dashboard_tasks` as a JSON array.
- **Duplicate prevention**: adding a task whose text matches an existing task (case-insensitive, trimmed) is rejected — show a brief inline error message.
- Tasks persist across page refreshes.

### FR-4 · Quick Links
- Display a list of saved URLs as clickable **buttons/chips** that open in a new tab.
- **Add** a link via two inputs: Label and URL, plus an "Add" button.
- **Remove** any link via a × button on each chip.
- Links are stored in Local Storage under the key `dashboard_links` as a JSON array of `{label, url}` objects.
- Links persist across page refreshes.

---

## Challenge Requirements

### CH-1 · Light / Dark Mode Toggle
- A toggle button (e.g. ☀ / ☾ icon) switches between light and dark themes.
- The chosen mode is saved in Local Storage under `dashboard_theme` (`"light"` or `"dark"`).
- On load, apply the saved theme before rendering to prevent flash.

### CH-2 · Custom Name in Greeting
- Covered under FR-1 above.

### CH-3 · Duplicate Task Prevention
- Covered under FR-3 above.

---

## Non-Functional Requirements

- **NFR-1** File structure: `index.html` at root, `css/style.css`, `js/script.js` — exactly these three files.
- **NFR-2** No external libraries, frameworks, or CDN-loaded CSS resets beyond what is written inline.
- **NFR-3** Works in latest Chrome, Firefox, Edge, and Safari without polyfills.
- **NFR-4** Responsive layout: usable on screens ≥ 320 px wide.
- **NFR-5** Clean, readable code with comments explaining major sections.
- **NFR-6** Fast load: no render-blocking resources; CSS in `<head>`, JS deferred or at bottom of `<body>`.

---

## Layout

```
┌──────────────────────────────────────────────┐
│              Greeting Card (full width)       │
└──────────────────────────────────────────────┘
┌─────────────────┐  ┌──────────────────────────┐
│   Focus Timer   │  │       To-Do List          │
└─────────────────┘  └──────────────────────────┘
┌──────────────────────────────────────────────┐
│              Quick Links (full width)         │
└──────────────────────────────────────────────┘
```

The grid uses CSS Grid or Flexbox — no CSS framework.
