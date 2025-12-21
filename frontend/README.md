
---

# 🎨 Frontend – Real-Time Transaction and Audit Log System

---

## 📌 Project Overview

This frontend is part of **Assignment 2: Real-Time Transaction and Audit Log System**.

The goal of this frontend is to provide a **secure, user-friendly, and audit-clear interface** for interacting with the backend peer-to-peer fund transfer system.

The frontend is designed to correctly represent **real financial flows**, including:

* user-to-user transfers
* system-initiated top-ups
* immutable audit logs

Special attention was given to **security, correctness, and clarity**, rather than only UI appearance.

---

## 🎯 Key Objectives

The frontend was built to satisfy the following requirements:

* Secure JWT-based authentication
* Safe session restoration and logout handling
* User-friendly fund transfer using **public payment identifiers**
* Clear differentiation between:

  * Incoming transfers
  * Outgoing transfers
  * System top-up transactions
* Accurate dashboard analytics (Sent / Received / Balance)
* Audit-grade transaction history display

The frontend strictly avoids exposing **database primary keys** and relies only on **public identifiers**.

---

## 🧱 Technology Stack

* **React (TypeScript)**
* **Vite**
* **Tailwind CSS**
* **Axios**
* **JWT Authentication**
* **Lucide Icons**

---

## ⚙️ Setup / Run Instructions (Frontend)

### Prerequisites

* Node.js **18+**
* npm or yarn
* Backend service running locally

---

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

---

### Step 2: Install Dependencies

```bash
npm install
```

---

### Step 3: Start Development Server

```bash
npm run dev
```

Frontend will be available at:

```
http://localhost:5173
```

⚠️ Ensure the backend is running on:

```
http://localhost:8000
```

---

## 🔐 Authentication & Session Handling

* JWT token is received on login
* Token is stored in `localStorage`
* All protected API requests include:

```
Authorization: Bearer <access_token>
```

* Session is restored on refresh using `/me`
* Token is re-attached to Axios before every protected request
* On `401 Unauthorized`, the user is logged out safely

This prevents random session drops and ensures consistent behavior.

---

## 💸 Core Functional Features

### ✅ Fund Transfer

* Transfers use **Public Payment ID**
* Prevents self-transfer
* Validates amount and balance
* UI updates instantly after success

---

### ✅ Add Balance (Top-Up)

* Represents **System → User** transaction
* Clearly labeled as `TOP_UP`
* Displayed as coming from **System / Payment Gateway**
* Prevents confusion with self-transfers

---

### ✅ Transaction History (Audit Log)

The transaction table displays:

* Transaction ID
* Type (Sent / Received / Top-Up)
* Sender Name
* Receiver Name
* Public IDs
* Amount
* Status
* Date & Time

Additional UX considerations:

* Horizontal and vertical scrolling
* Clear visual distinction between transaction types
* Immutable display matching backend audit logs

---

### ✅ Dashboard Analytics

* Current balance
* Total Sent (excluding TOP_UP)
* Total Received (excluding TOP_UP)
* Manual **Sync Data** button

All calculations are derived from audit data and use **public identifiers**.

---

## 🧠 Identity & Security Design

To follow real-world financial system practices:

* Database primary keys are **never exposed**
* All frontend logic uses:

  * `public_id` / payment identifier
* Prevents:

  * ID enumeration
  * Internal DB leakage
  * Security vulnerabilities

This design is inspired by systems such as **UPI and PayPal**, where internal IDs are hidden from users.

---

## 🔌 Frontend–Backend Integration

| Method | Endpoint        | Purpose          |
| ------ | --------------- | ---------------- |
| POST   | `/register`     | Create user      |
| POST   | `/login`        | Authenticate     |
| GET    | `/me`           | Validate session |
| POST   | `/transfer`     | Fund transfer    |
| POST   | `/add-balance`  | System top-up    |
| GET    | `/transactions` | Audit log        |

All sensitive endpoints require JWT authentication.

---

## 📂 Frontend Project Structure

```
src/
├── api/
│   ├── axios.ts
│   └── transactions.ts
├── components/
│   ├── Layout.tsx
│   ├── TransactionTable.tsx
│   └── AddBalanceModal.tsx
├── context/
│   └── AuthContext.tsx
├── pages/
│   ├── Login.tsx
│   ├── Register.tsx
│   └── Dashboard.tsx
├── types.ts
├── App.tsx
└── main.tsx
```

---

## 🤖 AI Tool Usage Log (MANDATORY)

### AI Tool Used

* **ChatGPT**

---

### AI-Assisted Tasks

AI tools were used during development to **improve efficiency and problem-solving**, specifically for:

* Debugging JWT session expiration and random logout issues
* Identifying frontend–backend contract mismatches
* Fixing Axios authorization header persistence
* Improving audit-log UI logic
* Correctly differentiating TOP_UP vs transfer transactions
* Reviewing React state and effect dependencies
* Improving overall code structure and clarity
* Assisting with frontend documentation

---

### AI Limitations and Errors Faced (Important)

AI suggestions were **not always correct** and required manual correction.
Some notable issues included:

* Incorrect assumptions about token persistence in Axios
* Incomplete suggestions for JWT session restoration
* Misinterpretation of transaction types (TOP_UP vs TRANSFER)
* UI logic that initially misrepresented system transactions as self-transfers

All such issues were **identified, debugged, and fixed manually using code inspection, logs, and testing**, sometimes with AI assistance.
---
🧠 Overall Learnings from These Fixes

* This project closely simulated real workplace debugging, where:

* Bugs were rarely isolated to one file

* Issues often involved frontend–backend interaction

* Small oversights caused cascading failures

* Logs, network inspection, and step-by-step reasoning were essential

These fixes significantly improved:

* system stability

* security

* correctness

* developer confidence
---

## 📊 Effectiveness Score

**Score: 4 / 5**

### Honest Justification

AI tools significantly improved productivity in:

* Debugging authentication issues
* Identifying logic errors
* Reviewing React component behavior
* Writing structured documentation

However, manual effort was still required for:

* Correct system behavior verification
* Edge-case handling
* Ensuring frontend accuracy against backend audit logic

AI was used as a **development assistant**.

---

## 🏁 Final Notes

This frontend was built with a focus on:

* Security
* Audit clarity
* Correct financial behavior
* Maintainability
* Real-world system design principles


---
👍
