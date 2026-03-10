# Facial Recognition Attendance System — Frontend

A Next.js web application for managing and viewing attendance records. Built as part of a three-part system alongside the backend API and facial recognition ML module.

## Live URL
[https://attendance-frontend-eta-nine.vercel.app](https://attendance-frontend-eta-nine.vercel.app)

---

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Deployed on Vercel

---

## Project Structure

```
app/
├── login/          # Login page (students, professors)
├── student/        # Student dashboard — attendance percentages
├── professor/      # Professor dashboard — today's schedule, start attendance
├── admin/
│   ├── students/   # Manage students
│   ├── professors/ # Manage professors
│   ├── classes/    # Manage courses
│   ├── enrollment/ # Enroll students in courses
│   ├── timetable/  # Build timetable
│   └── classrooms/ # Manage classrooms
└── store/
    └── dataStore.tsx  # Global state (currentUser, students, classes, etc.)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/advika-n/facial-recognition-attendance-frontend.git
cd facial-recognition-attendance-frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Authentication

| Role | Login with |
|---|---|
| Student | Registration number as both ID and password |
| Professor | Professor ID as both ID and password |
| Admin | Direct URL access at `/admin` |

---

## Environment

The backend API URL is hardcoded in each page:

```js
const API = "https://facial-recognition-attendance-backend-production.up.railway.app"
```

If the backend URL changes, update this in every page file.

---

## Deployment

Vercel auto-deploys on every push to the `main` branch of this repo. No manual steps needed.

---

## Related Repos
- [Backend API](https://github.com/advika-n/facial-recognition-attendance-backend)
- ML Module (facial recognition) — separate repo, runs locally on camera device
