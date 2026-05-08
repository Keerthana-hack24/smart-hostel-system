# SMART HOSTEL FACILITY MANAGEMENT AND COMPLAINT TRACKING SYSTEM

A full-stack hostel management system with role-based portals for **Students**, **Staff**, and **Admins**. Built with Node.js, Express, MySQL, and MongoDB.

## Features

**Students**
- Register, log in, and view room info
- Submit complaints with category, priority, and optional photo attachments
- Track complaint status and view full history timeline
- Start laundry sessions and check machine availability
- Receive notifications for complaint updates

**Staff**
- Log in and view all assigned complaints
- Update complaint status (`In Progress` / `Resolved`) with remarks
- View history timeline and attached photos per complaint

**Admin**
- View all complaints with filters by status and priority
- Assign pending complaints to staff members
- Monitor all laundry machines and active sessions
- View the full staff directory

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Relational DB | MySQL — complaints, students, staff, assignments, laundry |
| NoSQL DB | MongoDB — complaint history, attachments, notifications, laundry logs |
| File Uploads | Multer + Cloudinary (auto-falls back to local disk) |
| Frontend | Vanilla HTML, CSS, JS |

MySQL handles all transactional data with **stored procedures** (`StartLaundry`, `CompleteLaundry`), **triggers** (auto-assign status, validate feedback, set resolved date), **views** (`Running_Laundry`, `Available_Machines`), and **role-based permissions**. MongoDB handles append-only records like timelines and logs.

## Project Structure

```
├── backend/
│   ├── main.js              # Express entry point
│   ├── db/
│   │   ├── mysql.js
│   │   └── mongo.js
│   ├── routes/
│   │   ├── students.js
│   │   ├── staff.js
│   │   ├── complaints.js
│   │   ├── laundry.js
│   │   └── notifications.js
│   ├── models/
│   │   ├── ComplaintHistory.js
│   │   ├── ComplaintAttachment.js
│   │   ├── Notification.js
│   │   ├── LaundryLog.js
│   │   └── LaundryNotification.js
│   └── middleware/
│       └── upload.js
├── frontend/
│   ├── index.html           # Login
│   ├── student.html
│   ├── staff.html
│   ├── admin.html
│   ├── style.css
│   └── api.js
└── sql/
    ├── schema.sql           # Tables, triggers, views, roles
    └── data.sql             # Seed data
```

---

## Setup

### Prerequisites
- Node.js v18+, MySQL 8+, MongoDB (local or Atlas)

### 1. Clone & install

```bash
git clone https://github.com/your-username/smart-hostel.git
cd smart-hostel
npm install
```

### 2. Set up MySQL

```bash
mysql -u root -p < schema.sql
mysql -u root -p < data.sql
```

### 3. Configure environment

Create a `.env` file in the root:

```env
PORT=5000

MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DB=smart_hostel

MONGO_URI=mongodb://localhost:27017/hostel_db

# Optional — omit to use local disk storage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 4. Run

```bash
npm run dev    # development (nodemon)
npm start      # production
```

Server starts at `http://localhost:5000`. Open `frontend/index.html` in your browser.

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/students/register` | Register student |
| POST | `/api/students/login` | Student login |
| POST | `/api/staff/login` | Staff login |
| GET | `/api/complaints` | All complaints (admin) |
| GET | `/api/complaints/student/:id` | Student's complaints |
| GET | `/api/complaints/:id` | Single complaint + timeline + attachments |
| POST | `/api/complaints` | Submit complaint (multipart, supports images) |
| PATCH | `/api/complaints/:id/status` | Update status |
| POST | `/api/complaints/assign` | Assign to staff |
| POST | `/api/complaints/feedback` | Submit feedback (resolved only) |
| GET | `/api/laundry/machines` | All machines |
| GET | `/api/laundry/running` | Active sessions |
| POST | `/api/laundry/start` | Start session |
| POST | `/api/laundry/complete` | Complete session |
| GET | `/api/notifications/:user_id` | Get notifications |


