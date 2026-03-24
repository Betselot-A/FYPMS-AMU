# API Documentation — Project Collaboration System (MERN Backend)

> **Base URL:** `http://localhost:5000/api`
> **Auth:** JWT Bearer token in `Authorization` header
> **Content-Type:** `application/json` (unless file upload)

---

## 1. Authentication

### POST `/auth/login`
Login with email and password. Returns JWT token.

**Request:**
```json
{ "email": "alice@university.edu", "password": "password123" }
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "s1",
    "name": "Alice Johnson",
    "email": "alice@university.edu",
    "role": "student",
    "department": "Computer Science",
    "createdAt": "2025-09-01",
    "cgpa": 3.85
  }
}
```

**Errors:** `401` Invalid credentials

---

### POST `/auth/logout`
🔒 Authenticated. Invalidates current token.

**Response (200):** `{ "message": "Logged out" }`

---

### GET `/auth/me`
🔒 Authenticated. Returns current user profile.

**Response (200):** `User` object

---

### PUT `/auth/change-password`
🔒 Authenticated. Change own password.

**Request:**
```json
{ "currentPassword": "oldpass", "newPassword": "newpass123" }
```

**Response (200):** `{ "message": "Password changed" }`

---

### POST `/auth/reset-password/:userId`
🔒 Admin only. Generate a temporary password for a user.

**Response (200):**
```json
{ "tempPassword": "TempPass_a1b2c3" }
```

---

## 2. User Management (Admin)

### GET `/users`
🔒 Admin/Coordinator. List users with optional filters.

**Query params:** `role`, `department`, `search`, `page` (default 1), `limit` (default 20)

**Response (200):**
```json
{
  "users": [ /* User[] */ ],
  "total": 45
}
```

---

### GET `/users/:id`
🔒 Authenticated. Get single user.

**Response (200):** `User` object

---

### POST `/users`
🔒 Admin only. Create a new user account.

**Request:**
```json
{
  "name": "New Student",
  "email": "newstudent@university.edu",
  "role": "student",
  "department": "Computer Science",
  "staffAssignment": { "isAdvisor": false, "isExaminer": false }
}
```

**Response (201):**
```json
{
  "user": { /* User */ },
  "tempPassword": "TempPass_x1y2z3"
}
```

---

### PUT `/users/:id`
🔒 Admin only. Update user details.

**Request:** Partial `User` fields  
**Response (200):** Updated `User`

---

### DELETE `/users/:id`
🔒 Admin only.

**Response (200):** `{ "message": "User deleted" }`

---

### POST `/users/bulk`
🔒 Admin only. Bulk create users.

**Request:**
```json
{ "users": [ /* CreateUserRequest[] */ ] }
```

**Response (200):**
```json
{ "created": 5, "errors": ["Row 3: email already exists"] }
```

---

## 3. Projects

### GET `/projects`
🔒 Authenticated. Returns projects based on user role:
- **Student:** own projects
- **Staff:** projects where advisor/examiner
- **Coordinator/Admin:** all projects

**Query params:** `status`, `advisorId`, `examinerId`

**Response (200):** `Project[]`

---

### GET `/projects/:id`
🔒 Authenticated (must be member/advisor/examiner/coordinator/admin).

**Response (200):** `Project` object with milestones

---

### POST `/projects`
🔒 Coordinator only.

**Request:**
```json
{
  "title": "AI Attendance System",
  "description": "...",
  "groupMembers": ["s1", "s2"],
  "advisorId": "st1",
  "examinerId": "st3",
  "deadline": "2026-06-15"
}
```

**Response (201):** `Project`

---

### PUT `/projects/:id`
🔒 Coordinator only.

**Request:** Partial `Project` fields  
**Response (200):** Updated `Project`

---

### DELETE `/projects/:id`
🔒 Coordinator only.

**Response (200):** `{ "message": "Project deleted" }`

---

### PUT `/projects/:projectId/milestones/:milestoneId`
🔒 Advisor/Coordinator.

**Request:**
```json
{ "status": "approved", "dueDate": "2026-03-01" }
```

**Response (200):** Updated `Milestone`

---

## 4. Submissions

### GET `/projects/:projectId/submissions`
🔒 Authenticated (project member/advisor/examiner/coordinator).

**Response (200):** `Submission[]`

---

### POST `/projects/:projectId/submissions`
🔒 Student (project member only). **`multipart/form-data`**

**Form fields:**
- `title` (string)
- `files` (File[]) — max 5 files, 10MB each

**Response (201):** `Submission`

---

### POST `/submissions/:submissionId/feedback`
🔒 Staff (advisor/examiner of the project).

**Request:**
```json
{ "message": "Good progress! Fix the references." }
```

**Response (201):** `Feedback`

---

## 5. Evaluation & Grading

### GET `/evaluation/phases`
🔒 Coordinator/Admin. Get evaluation criteria configuration.

**Response (200):**
```json
[
  {
    "id": "phase-advisor",
    "name": "Advisor Evaluation",
    "active": true,
    "weight": 35,
    "criteria": [
      { "id": "c1", "label": "Project understanding", "maxMark": 10 },
      { "id": "c2", "label": "Progress and effort", "maxMark": 10 }
    ]
  }
]
```

---

### PUT `/evaluation/phases`
🔒 Coordinator only. Save criteria configuration.

**Request:**
```json
{ "phases": [ /* EvaluationPhase[] */ ] }
```

**Validation:** Total active weight must equal 100%.

**Response (200):** `{ "message": "Phases updated" }`

---

### POST `/evaluation/submit`
🔒 Staff. Submit marks for a project.

**Request:**
```json
{
  "projectId": "p1",
  "phaseId": "phase-advisor",
  "marks": [
    { "criterionId": "c1", "mark": 8 },
    { "criterionId": "c2", "mark": 9 }
  ],
  "comments": "Excellent work"
}
```

**Validation:** Each mark ≤ criterion maxMark.

**Response (201):** `EvaluationResult`

---

### GET `/evaluation/project/:projectId`
🔒 Staff/Coordinator. Get all evaluations for a project.

**Response (200):** `EvaluationResult[]`

---

### GET `/evaluation/grades`
🔒 Admin. Get grade boundaries.

**Response (200):**
```json
[
  { "grade": "A+", "minPercentage": 90, "maxPercentage": 100 },
  { "grade": "A",  "minPercentage": 80, "maxPercentage": 89 }
]
```

---

### PUT `/evaluation/grades`
🔒 Admin only.

**Request:**
```json
{ "boundaries": [ /* GradeBoundary[] */ ] }
```

**Response (200):** `{ "message": "Grade boundaries updated" }`

---

### GET `/evaluation/results/:projectId`
🔒 Student (own project)/Coordinator/Admin.

**Response (200):**
```json
{
  "phases": [ /* EvaluationResult[] */ ],
  "totalPercentage": 82.5,
  "finalGrade": "A"
}
```

---

## 6. Notifications

### GET `/notifications`
🔒 Authenticated. Get current user's notifications.

**Response (200):** `Notification[]`

---

### PUT `/notifications/:id/read`
🔒 Authenticated.

**Response (200):** `{ "message": "Marked as read" }`

---

### PUT `/notifications/read-all`
🔒 Authenticated.

**Response (200):** `{ "message": "All marked as read" }`

---

## 7. Messages

### GET `/messages/conversations`
🔒 Authenticated. List conversations.

**Response (200):**
```json
[
  { "userId": "st1", "userName": "Dr. Sarah Wilson", "lastMessage": "Sure!", "date": "2025-10-29" }
]
```

---

### GET `/messages/:otherUserId`
🔒 Authenticated. Get message thread.

**Response (200):** `Message[]`

---

### POST `/messages`
🔒 Authenticated.

**Request:**
```json
{ "toUserId": "st1", "content": "Hello Dr. Wilson" }
```

**Response (201):** `Message`

---

## 8. System Settings (Admin)

### GET `/settings`
🔒 Admin.

**Response (200):**
```json
{
  "systemName": "FYP Management System",
  "academicYear": "2025-2026",
  "semester": "Fall",
  "evaluationWeights": { "advisor": 35, "coordinator": 15, "examiner": 20, "documentation": 30 },
  "notifications": { "emailOnSubmission": true, "emailOnGrade": true, "emailOnAnnouncement": true, "emailOnDeadline": true }
}
```

---

### PUT `/settings`
🔒 Admin only.

**Request:** Partial `SystemSettings`  
**Response (200):** Updated `SystemSettings`

---

## Data Models (MongoDB Schemas)

### User
```
_id, name, email, passwordHash, role (enum: student|staff|coordinator|admin),
department, avatar?, staffAssignment? { isAdvisor, isExaminer },
cgpa? (students only), mustChangePassword (boolean), createdAt
```

### Project
```
_id, title, description, groupMembers [ObjectId → User],
advisorId (ObjectId → User), examinerId? (ObjectId → User),
status (enum), deadline, milestones [{ title, dueDate, status, description }], createdAt
```

### Submission
```
_id, projectId (ObjectId → Project), userId (ObjectId → User),
title, files [String], feedback [{ fromUserId, fromUserName, message, date }],
status (enum), submissionDate
```

### EvaluationPhase
```
_id, name, active, weight, criteria [{ label, maxMark }]
```

### EvaluationResult
```
_id, projectId, evaluatorId, phaseId,
marks [{ criterionId, mark }], comments?, totalMark, submittedAt
```

### GradeBoundary
```
_id, grade, minPercentage, maxPercentage
```

### Notification
```
_id, userId, message, type (enum), read, date
```

### Message
```
_id, fromUserId, fromUserName, toUserId, content, date
```

### SystemSettings (single document)
```
_id, systemName, academicYear, semester, evaluationWeights {}, notifications {}
```

---

## Error Response Format

All errors follow:
```json
{
  "error": "Short error code",
  "message": "Human-readable description"
}
```

Common status codes: `400` validation, `401` unauthorized, `403` forbidden, `404` not found, `500` server error.

---

## Environment Variables (Express Backend)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fyp_system
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
```
