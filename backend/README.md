# Backend — Online Project Collaboration & Supervision System

## Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally or a MongoDB Atlas connection string

### Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 4. Start development server
npm run dev

# Or for production
npm start
```

The server runs at `http://localhost:5000`.

---

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| POST | `/api/auth/logout` | 🔒 | Logout |
| GET | `/api/auth/me` | 🔒 | Get current profile |
| PUT | `/api/auth/change-password` | 🔒 | Change own password |
| POST | `/api/auth/reset-password/:userId` | 🔒 Admin | Generate temp password |

### Users (Admin)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | 🔒 Admin/Coord | List users |
| POST | `/api/users` | 🔒 Admin | Create user |
| POST | `/api/users/bulk` | 🔒 Admin | Bulk create |
| GET | `/api/users/:id` | 🔒 | Get user |
| PUT | `/api/users/:id` | 🔒 Admin | Update user |
| DELETE | `/api/users/:id` | 🔒 Admin | Delete user |

### Projects
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/projects` | 🔒 | List (role-filtered) |
| GET | `/api/projects/:id` | 🔒 | Get project |
| POST | `/api/projects` | 🔒 Coord | Create |
| PUT | `/api/projects/:id` | 🔒 Coord | Update |
| DELETE | `/api/projects/:id` | 🔒 Coord | Delete |
| PUT | `/api/projects/:pid/milestones/:mid` | 🔒 Staff/Coord | Update milestone |

### Submissions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/submissions/:projectId` | 🔒 | Get submissions |
| POST | `/api/submissions` | 🔒 Student | Upload (multipart) |
| POST | `/api/submissions/:id/feedback` | 🔒 Staff | Add feedback |

### Staff
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/staff/advising-projects` | 🔒 Staff | Advising projects |
| GET | `/api/staff/examining-projects` | 🔒 Staff | Examining projects |

### Evaluations
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/evaluations` | 🔒 Staff/Coord | Submit marks |
| GET | `/api/evaluations/:projectId` | 🔒 | Get evaluations |
| GET | `/api/evaluations/results/:projectId` | 🔒 | Get results |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | 🔒 | Get notifications |
| PUT | `/api/notifications/:id/read` | 🔒 | Mark read |
| PUT | `/api/notifications/read-all` | 🔒 | Mark all read |
| POST | `/api/notifications` | 🔒 Admin/Coord | Send notification |

---

## Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── projectController.js
│   │   ├── submissionController.js
│   │   ├── staffController.js
│   │   ├── notificationController.js
│   │   └── evaluationController.js
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   ├── roleMiddleware.js    # Role-based access
│   │   ├── errorMiddleware.js   # Global error handler
│   │   └── uploadMiddleware.js  # Multer file uploads
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Submission.js
│   │   ├── Notification.js
│   │   └── Grade.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── submissionRoutes.js
│   │   ├── staffRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── evaluationRoutes.js
│   └── server.js               # Entry point
├── .env.example
├── package.json
└── README.md
```
