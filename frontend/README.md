# ProjectHub

A comprehensive Online Project Collaboration and Supervision System designed to streamline the Final Year Project (FYP) lifecycle.

## Overview

ProjectHub connects students, advisors, coordinators, and examiners on a single platform to manage:
- Student Grouping & Title Submission
- Proposal Approval Workflow
- Advisor & Examiner Assignment
- Milestone & Submission Tracking
- Evaluation & Grading

## Technology Stack

### Frontend
- **React** (Vite)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Lucide React** (Icons)
- **React Router**

### Backend
- **Node.js** (Express)
- **MongoDB** (Mongoose)
- **JWT** (Authentication)
- **Multer** (File Uploads)

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or via Atlas)

### Installation

1. **Clone the repository**
   ```sh
   git clone <repository-url>
   cd FinalYearProject
   ```

2. **Setup Backend**
   ```sh
   cd backend
   npm install
   # Create a .env file with MONGODB_URI and JWT_SECRET
   npm run dev
   ```

3. **Setup Frontend**
   ```sh
   cd ../frontend
   npm install
   # Create a .env file with VITE_API_BASE_URL
   npm run dev
   ```

## Roles

- **Student**: Form groups, submit proposals, track status, and upload project files.
- **Staff (Advisor/Examiner)**: Supervise projects, provide feedback, and evaluate performance.
- **Coordinator**: Manage groups, approve titles, and assign staff to projects.
- **Admin**: User management, system settings, and password resets.

---
© 2026 ProjectHub Team. All rights reserved.
