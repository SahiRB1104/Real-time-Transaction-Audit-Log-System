# 🔐 Backend – Real-Time Transaction and Audit Log System
---

## 📌 Project Overview

This backend is part of the  **Assignment 2: Real-Time Transaction and Audit Log System**.

To simulate a **secure peer-to-peer fund transfer system**, I built a backend service that satisfies the following requirements:

* **Atomic money transfers** — debit and credit operations occur together or not at all
* **Mandatory audit logging** for every transaction (both SUCCESS and FAILED)
* **JWT-based authentication and authorization**
* **Strong error handling and rollback mechanisms**

The focus of this implementation is the application of **real-world backend engineering principles**, with a strong emphasis on **transactional integrity, security, and reliability**.

---

## ⚙️ Setup / Run Instructions (Backend)

### Prerequisites

* Python **3.11+**
* PostgreSQL **14+**
* Git

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/SahiRB1104/Real-time-Transaction-Audit-Log-System
cd Real-time-Transaction-Audit-Log-System/backend
```

---

### Step 2: Create Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate   # Windows
```

---

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

---

### Step 4: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/transaction_db
JWT_SECRET_KEY=supersecretkey123
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
```

⚠️ Ensure the PostgreSQL database **`transaction_db`** exists before running the server.

---

### Step 5: Run the Backend Server

```bash
uvicorn app.main:app --reload
```

Open Swagger API documentation:

```
http://127.0.0.1:8000/docs
```

---

## 🔌 API Documentation (Core Endpoints)

### Public Endpoints

| Method | Endpoint    | Description           |
| ------ | ----------- | --------------------- |
| POST   | `/register` | Sign up a new user    |
| POST   | `/login`    | Login and receive JWT |

---

### Protected Endpoints (JWT Required)

| Method | Endpoint        | Description                     |
| ------ | --------------- | ------------------------------- |
| POST   | `/transfer`     | Atomic fund transfer            |
| GET    | `/transactions` | Transaction history (audit log) |

🔑 JWT must be passed as:

```
Authorization: <access_token>
```

---

## 🗄️ Database Schema

### Users Table

| Column          | Type          | Description            |
| --------------- | ------------- | ---------------------- |
| id              | Integer       | Primary key            |
| name            | Varchar       | User name              |
| email           | Varchar       | Unique email           |
| hashed_password | Varchar       | Bcrypt hashed password |
| balance         | NUMERIC(12,2) | Account balance        |
| created_at      | TIMESTAMP     | User creation time     |

---

### Transactions Table (Audit Log)

| Column      | Type          | Description      |
| ----------- | ------------- | ---------------- |
| id          | Integer       | Primary key      |
| sender_id   | Integer       | Sender user ID   |
| receiver_id | Integer       | Receiver user ID |
| amount      | NUMERIC(12,2) | Transfer amount  |
| status      | Varchar       | SUCCESS / FAILED |
| timestamp   | TIMESTAMP     | Transaction time |

---

## 🤖 AI Tool Usage Log (MANDATORY)

### AI Tool Used

* **ChatGPT**

---

### AI-Assisted Tasks

I used AI tools  during development to improve productivity and validate approaches.
The specific AI-assisted tasks included:

* Creating prototype functions for JWT authentication
* Presenting password hashing and verification logic using bcrypt
* Analyzing SQLAlchemy transaction patterns
* Designing the audit log schema
* Suggesting FastAPI dependency injection patterns
* Reviewing REST API error-handling structures
* Assisting in debugging session-related transaction issues
* Helping with backend documentation for the README

---

### AI Limitations and Errors Faced (Important)

AI-generated suggestions were **not always correct** and required manual debugging and correction.
Some notable issues included:

* Incorrect SQLAlchemy session usage suggested by AI, causing
  **`A transaction is already begun on this Session`** errors
* Early JWT examples lacked environment variable validation, resulting in
  **Unauthorized access issues**
* AI-generated bcrypt logic ignored the **72-byte password limit**, causing runtime failures
* Type mismatches between SQLAlchemy columns
  (**Decimal vs ColumnElement**) in AI-suggested code

All such issues were **identified, debugged, and fixed manually/using Ai**.

---

## 📊 Effectiveness Score

**Score: 3.5 / 5**

### Honest Justification

AI tools helped reduce time spent on:

* Writing boilerplate authentication code
* Structuring the API
* Writing documentation

However, significant time was spent debugging and correcting AI-generated code related to:

* SQLAlchemy transaction handling
* JWT authorization flow
* Password hashing edge cases

Overall, AI was helpful, but required **careful validation and manual correction**.

---

