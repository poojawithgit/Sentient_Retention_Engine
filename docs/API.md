# API Reference

**Base URL**: `/api/v1`

## 🔑 Authentication

### POST /auth/login

Authenticates a user and returns a JWT token.

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "securepassword"
}
```

**Response (200):**

```json
{
  "token": "eyJhbG...",
  "user": { "id": "user_001", "role": "admin" }
}
```

---

## 🧠 Retention & AI

### POST /retention/predict

Get churn prediction for a specific user.

**Authentication**: Required (any role)

**Request Body:**

```json
{
  "user_id": "cust_123",
  "usage": 45.5,
  "complaints": 2,
  "payment_delay": 1
}
```

---

### POST /retention/agent

Execute the full autonomous agent loop.

**Authentication**: Required (any role)

**Response (200):**

```json
{
  "best_action": "DISCOUNT",
  "reason": "High risk detected due to payment delay...",
  "simulations": { ... }
}
```

---

## 🚩 Escalation Management

### GET /retention/escalations/pending

Retrieve a list of unassigned high-risk escalations.

**Authentication**: Required (Specialist/Admin)

---

### POST /retention/escalations/claim

Claim an escalation for intervention.

**Authentication**: Required (Specialist)

**Request Body:**

```json
{
  "escalation_id": "esc_999"
}
```

---

## ⚙️ Administration

### POST /retention/admin/settings

Update global retention thresholds and strategy weights.

**Authentication**: Required (**Admin only**)

**Request Body:**

```json
{
  "threshold": 0.75,
  "auto_discount": true
}
```

---

### GET /retention/admin/health

Check the operational status of internal microservices (ML, AI).

**Authentication**: Required (**Admin only**)
