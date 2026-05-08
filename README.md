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


