
# 💳 Real-Time Transaction & Audit Log System  

---

## 📌 Project Overview

The primary goal of this project was to demonstrate **real-world backend engineering principles**, **secure frontend–backend communication**, and **audit-grade correctness**, rather than focusing only on basic CRUD functionality.

This system enables users to:
- Register and authenticate securely using JWT
- Transfer funds atomically between users
- Maintain a complete audit log for **every transaction (TRANSFER / TOP_UP / FAILED)**
- View real-time balance updates and transaction history from the frontend

The overall design closely reflects how **financial transaction systems** are implemented in production environments.

---
## 🎥 Demo Video

📌 **Video Link:**

> *(Add your screen recording link here before final submission)*

The demo showcases:

* User registration and login
* Atomic fund transfer flow
* Real-time balance updates
* Transaction audit log updates
* System-initiated balance top-ups

---
## 🧱 Architecture Overview

```

root/
├── backend/        → FastAPI + PostgreSQL (Audit-grade backend)
│   └── README.md   → Detailed backend setup & internal design
│
├── frontend/       → React + TypeScript (Secure user interface)
│   └── README.md   → Detailed frontend setup & UX logic
│
└── README.md       → (This file) Submission overview

````

👉 **Note:**  
For **detailed setup instructions, configuration, and internal design decisions**, please refer to the respective documentation:

- 🔗 **Frontend Documentation:** [`frontend/README.md`](./frontend/README.md)  
- 🔗 **Backend Documentation:** [`backend/README.md`](./backend/README.md)

---

## ⚙️ Setup / Run Instructions (Quick Start)

> This section provides a **high-level overview**.  
> Detailed, step-by-step instructions are available in the frontend and backend READMEs for clarity and modularity.

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/SahiRB1104/Real-time-Transaction-Audit-Log-System
cd Real-time-Transaction-Audit-Log-System
````

---

### 2️⃣ Start Backend

Please follow the complete instructions in:

👉 [`backend/README.md`](./backend/README.md)

Backend service runs on:

```
http://localhost:8000
```

Swagger API documentation:

```
http://localhost:8000/docs
```

---

### 3️⃣ Start Frontend

Please follow the complete instructions in:

👉 [`frontend/README.md`](./frontend/README.md)

Frontend application runs on:

```
http://localhost:5173
```

---

## 🔌 API Documentation (Core Endpoints)

Below is a **summary of the core APIs** used by the system.
Detailed request and response formats are available in the backend README and Swagger UI.

### 🔓 Public APIs

| Method | Endpoint    | Purpose                  |
| ------ | ----------- | ------------------------ |
| POST   | `/register` | User registration        |
| POST   | `/login`    | JWT-based authentication |

---

### 🔐 Protected APIs (JWT Required)

| Method | Endpoint        | Purpose                        |
| ------ | --------------- | ------------------------------ |
| GET    | `/me`           | Validate token & fetch profile |
| POST   | `/transfer`     | Atomic fund transfer           |
| POST   | `/add-balance`  | System → User balance top-up   |
| GET    | `/transactions` | Transaction audit log          |

JWT is passed via request header:

```
Authorization: Bearer <access_token>
```

---

## 🗄️ Database Schema (Summary)

### Users Table

* Stores user identity and account balance
* Internal primary keys are used only at the backend level
* A **public identifier (`public_id`)** is exposed for transfers to enhance security

### Transactions Table (Audit Log)

* Maintains an immutable record of all transactions
* Stores sender and receiver snapshot data
* Supports the following transaction types:

  * `TRANSFER`
  * `TOP_UP`
  * `FAILED`

📌 **Design Highlight:**
Audit records are stored independently of joins, ensuring historical accuracy even if user data changes later.

👉 A complete schema explanation is available in [`backend/README.md`](./backend/README.md)

---

## 🤖 AI Tool Usage Log (MANDATORY)

### AI Tool Used

* **ChatGPT**

AI tools were used as **development accelerators and validation aids**, while all final architectural and implementation decisions were made manually.

---

### 🧠 AI-Assisted Tasks

AI assistance was used productively during development for the following tasks:

**Backend**

* Generating initial FastAPI and SQLAlchemy boilerplate
* Exploring best practices for database transactions and atomicity
* Reviewing JWT authentication flows
* Validating audit log schema design
* Assisting with backend documentation structure

**Frontend**

* Reviewing JWT session persistence strategies
* Improving Axios authorization handling
* Validating React state management patterns
* Enhancing audit table clarity and UX
* Structuring frontend documentation

---

### 📊 Effectiveness Score

**Overall AI Effectiveness: 4 / 5**

**Justification:**

* Significantly reduced time spent on boilerplate code
* Improved debugging efficiency
* Helped validate architectural approaches
* Supported clear and structured documentation

AI was used as a **productivity amplifier**, while full control over system correctness and security was retained.

---

## 🧪 Error Scenarios, Testing & Fixes (AI + Manual Validation)

During development of this project in a **workplace-simulated environment**, multiple real-world edge cases were identified and addressed using a combination of **AI-assisted analysis**, **manual debugging**, and **systematic testing**.

This process closely resembled how issues are identified, tested, and resolved in real production systems.

---

### 🔁 1. Concurrent Transfer & Balance Consistency

**Scenario**
Simultaneous transfers initiated against the same account required strict consistency guarantees.

**Approach**

* Implemented **row-level locking** using `SELECT … FOR UPDATE`
* Wrapped debit and credit operations inside a **single database transaction**
* Verified behavior through repeated concurrent manual requests

**Result**
Ensured **atomicity and balance correctness**, matching real financial system expectations.

---

### 🔐 2. JWT Session Validation & Expiry Handling

**Scenario**
Session continuity needed to remain reliable across token expiry and browser refreshes.

**Approach**

* Introduced a `/me` endpoint for **JWT validation**
* Ensured Axios consistently attaches authorization headers
* Implemented graceful logout handling for expired or invalid tokens

**Result**
Session behavior became **stable, predictable, and secure** across all user interactions.

---

### 💸 3. Self-Transfer & Invalid Receiver Protection

**Scenario**
Users could potentially attempt:

* Transfers to themselves
* Transfers to invalid or non-existent accounts

**Approach**

* Added frontend and backend validation for:

  * Self-transfer prevention
  * Receiver validation using `public_id`
* Ensured all failed attempts were captured in the audit log

**Result**
Improved **data integrity**, audit completeness, and overall system robustness.

---

### 🧾 4. Audit Log Accuracy & Classification

**Scenario**
Audit clarity was essential to clearly distinguish between user transfers and system actions.

**Approach**

* Introduced explicit transaction types (`TRANSFER`, `TOP_UP`)
* Updated frontend rendering logic to reflect transaction intent accurately
* Cross-validated frontend display against backend audit records

**Result**
Audit logs became **clear, interpretable, and aligned with real-world accounting practices**.

---

### ⚙️ 5. AI-Assisted Review with Manual Validation

**Approach**
AI tools were used to:

* Review transaction logic
* Suggest potential edge cases
* Validate architectural patterns

All AI recommendations were:

* Reviewed manually
* Tested locally
* Adopted only when they matched expected system guarantees

**Result**
This hybrid workflow improved **development speed** while maintaining **engineering correctness**.

---

### 🧠 Overall Learnings from Testing & Validation

This phase reinforced important real-world engineering practices:

* Most issues arise from **system interactions**, not isolated code
* Manual testing remains essential even with AI assistance
* Logs and audit trails significantly simplify validation and debugging
* Clear transactional boundaries improve system reliability

These learnings contributed directly to:

* Improved system stability
* Stronger security guarantees
* Cleaner audit behavior
* Higher confidence in production readiness

---


## 🏁 Final Notes

This project was built with strong emphasis on:

* Transactional integrity
* Security and correctness
* Clear and immutable audit trails
* Clean separation of frontend and backend concerns
* Practical, real-world system design principles



```

---

