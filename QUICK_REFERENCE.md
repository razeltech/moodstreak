# MoodStreak — Quick Reference & Architecture Guide

## 📋 Document Index
1. **Phase Overview & Timeline**
2. **Data Model Diagram**
3. **Component Dependency Tree**
4. **Tech Stack Decision Matrix**
5. **Deployment Checklist**
6. **Risk Register**

---

## 🎯 Phase Overview & Timeline

### Phase 1: MVP (8 Weeks / ~168 Hours)

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: MVP — Core Journaling & Mood Tracking                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Week 1: Foundation          [████░░░░░░░░░░░░░░░░░░░░] 18h    │
│  Week 2: AppShell & Nav      [████████░░░░░░░░░░░░░░░░] 17h    │
│  Week 3: Diary Management    [███████████░░░░░░░░░░░░░] 25h    │
│  Week 4: Entry Editor        [████████░░░░░░░░░░░░░░░░] 21h    │
│  Week 5: Today & Stats       [██████████░░░░░░░░░░░░░░] 19h    │
│  Week 6: Mood Grid           [████████░░░░░░░░░░░░░░░░] 16h    │
│  Week 7: Search & Favorites  [████████░░░░░░░░░░░░░░░░] 17h    │
│  Week 8: Settings & PWA      [████████████░░░░░░░░░░░░] 27h    │
│  Week 8+: QA & Polish        [████████░░░░░░░░░░░░░░░░] 18h    │
│                                                                   │
│  Total: ~168 hours                                               │
│  Launch Date: Week 9                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Model Diagram (Dexie.js)

```
┌─────────────────────┐   ┌──────────────────────┐
│    DIARIES TABLE    │   │   ENTRIES TABLE      │
├─────────────────────┤   ├──────────────────────┤
│ id (PK)             │   │ id (PK)              │
│ name                │───│ diaryId (FK)         │
│ coverID             │   │ date (YYYY-MM-DD)    │
│ accentColor         │   │ title                │
│ pageWidth           │   │ body (HTML)          │
│ pageHeight          │   │ moodName             │
│ createdAt           │   │ moodColor            │
│                     │   │ isFavorite           │
│                     │   │ wordCount            │
│                     │   │ doodles []           │
│                     │   │ stickers []          │
└─────────────────────┘   └──────────────────────┘

┌─────────────────────┐   ┌──────────────────────┐
│    MOODS TABLE      │   │  SETTINGS TABLE      │
├─────────────────────┤   ├──────────────────────┤
│ id (PK)             │   │ id = 1 (singleton)   │
│ date (YYYY-MM-DD)   │   │ activeTheme          │
│ moodName            │   │ activeFont           │
│ moodColor           │   │ paperStyle           │
│ note                │   │ fontSize             │
└─────────────────────┘   │ pinHash              │
                          │ lockTimeout          │
                          └──────────────────────┘
```

---

## 🔧 Tech Stack Decision Matrix

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend** | React + Vite | Fast, modern, great ecosystem |
| **Styling** | Tailwind CSS | Utility-first, fast prototyping |
| **Database** | Dexie.js | Best-in-class IndexedDB wrapper |
| **Animations** | Motion (motion/react) | Smooth, declarative animations |
| **Icons** | Lucide React | Clean, consistent icon set |
| **Rich Text** | native contentEditable | Lightweight, paper-like feel |

---

## ⚠️ Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Browser Quota | High | Regular export reminders |
| PWA Support | Medium | Clear installation guides for iOS/Android |
| PIN Lock Bypass | Low | Secure hashing (PBKDF2) |

---

**Version:** 1.0  
**Last Updated:** May 2026
