# 🛡️ Admin System Settings Guide

Welcome to the **ProjectHub Control Center**. This guide helps you configure the platform for your institution and set up critical automation services like email notifications.

---

## 1. Global Platform Configuration

### 🏷️ General Settings
- **System Display Name**: Your institution's name (e.g., "Arba Minch University"). This appears in all system-generated communications.
- **Default User Password**: The "out-of-the-box" password for new users. 
  > [!NOTE]
  > For security, users are forced to change this password on their very first login.

### 🎓 Academic Period
- **Active Semester/Year**: Controls which cohort is currently active. Changing this will filter the dashboard to show current projects only.
- **Proposal Master Switch**: Toggle "Allow New Project Proposals" to **OFF** to immediately lock the system once the registration period ends.

---

## 2. 🔐 Gmail SMTP Setup (Step-by-Step)

If you are using a Gmail account to send system emails, you **cannot** use your normal password. You must use a **Google App Password**.

### Step 1: Enable 2-Step Verification
1. Go to your [Google Account Settings](https://myaccount.google.com/).
2. Select **Security** on the left menu.
3. Under "How you sign in to Google," ensure **2-Step Verification** is turned **ON**.

### Step 2: Create an App Password
1. Search for "App Passwords" in the search bar at the top of your Google Account page.
2. Under "Select App," choose **Mail**.
3. Under "Select Device," choose **Other** and type `ProjectHub`.
4. Click **Generate**.

### Step 3: Configure ProjectHub
1. **Copy** the 16-character code (e.g., `xxxx yyyy zzzz wwww`).
2. Go to **Settings > Email** in ProjectHub.
3. Enter the following:
   - **SMTP Host**: `smtp.gmail.com`
   - **SMTP Port**: `587`
   - **Username**: Your full Gmail address.
   - **Password**: Paste the 16-character code here (remove any spaces).
4. Click **Save All Changes**.

---

## 3. 🧪 Verifying the Connection

After saving your settings, use the **Verify Configuration** button at the bottom of the Email tab.

- **Success**: You will receive a "SMTP Connection Success" notification, and a test email will be sent to your admin inbox.
- **Failure**: The system will provide a detailed error message (e.g., "Authentication Failed"). Double-check that your App Password is correct and that your From Address is authorized.

---
*Generated for Arba Minch University — Final Year Project Management System*
