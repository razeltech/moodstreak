# MoodStreak — Product Requirements Document (PRD) v2.0

## 🌸 1. Product Overview
MoodStreak is a beautiful, offline-first personal diary and mood tracking PWA. It combines Japanese ink-inspired aesthetics with modern data visualization.

---

## ✨ 2. Core Features (MVP)

### 2.1 — Diary Management
- Create multiple diaries with custom covers and names.
- Configurable page dimensions.

### 2.2 — Daily Entry Writing
- Rich text editor with lined paper aesthetic.
- Support for bold, italic, underline, and color.
- Autosave to local database (Dexie).

### 2.3 — Mood Tracking
- 8 default moods with emojis.
- Mood coloring throughout the UI.

### 2.4 — Mood Grid (Year Heatmap)
- Contribution-style grid showing a year of moods.
- Tooltips with entry previews.

### 2.5 — Search & Filtering
- Fuzzy search via Fuse.js.
- Filter by date, mood, and favorite status.

### 2.6 — Security & Privacy
- Optional PIN Lock with secure hashing.
- Entirely offline-first (IndexedDB).

### 2.7 — Export & Backup
- Export data as JSON (Backup).
- Export entries as PDF/TXT.

---

## 🎁 3. Phase 2 Features

### 3.1 — Doodle Canvas
- Draw directly on entries.
- Persistent sketch data.

### 3.2 — Sticker Tray
- Decorative stickers (SVG-based).
- Drag, rotate, and scale stickers on the page.

### 3.3 — Mic-to-Text
- Voice dictation for entries using Web Speech API.

---

## 🏛️ 4. Technical Stack
- **Framework:** React + Vite
- **Database:** Dexie.js (IndexedDB)
- **Styling:** Tailwind CSS
- **Animation:** Motion (motion/react)
- **Search:** Fuse.js
- **Export:** jsPDF, html2canvas

---

**Document Version:** 2.0  
**Last Updated:** May 2026
