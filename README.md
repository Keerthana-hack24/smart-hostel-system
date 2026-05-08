# Smart Hostel Facility Management and Complaint Tracking System

A hostel management system with three portals — Student, Staff, and Admin — built with Node.js, Express, MySQL and MongoDB.

Features

Students — submit complaints with photos, track status, manage laundry sessions
Staff — view assigned complaints, update status with remarks and timeline
Admin — assign complaints to staff, monitor all laundry machines

Stack

Backend — Node.js + Express
MySQL — students, complaints, assignments, laundry (with triggers, stored procedures, views)
MongoDB — complaint history, photo attachments, notifications, laundry logs
Uploads — Cloudinary (falls back to local disk)
