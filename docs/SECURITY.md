# Security Architecture & Hardening

## Overview

The Sentient Retention Engine follows a "Zero Trust" security model for configuration and a "Least Privilege" model for access control. This document outlines the security measures implemented to protect customer data and administrative functions.

## 🛡️ Core Security Principles

### 1. Zero-Trust Configuration

- **No Hardcoded Secrets**: All sensitive data (database URLs, API keys, JWT secrets) are injected via environment variables.
- **Fail-Safe Defaults**: Services are configured to fail immediately if critical environment variables are missing, preventing "fail-open" scenarios.

### 2. Role-Based Access Control (RBAC)

The system differentiates between standard users and administrators:

- **`specialist`**: Can view and claim escalations assigned to them.
- **`admin`**: Full access to system health, settings, and specialist management.

Access is enforced at the route level via the `restrictTo` middleware:

```javascript
router.get('/admin/health', auth.protect, auth.restrictTo('admin'), controller.getSystemHealth);
```

### 3. IDOR (Insecure Direct Object Reference) Prevention

To prevent users from accessing or modifying data belonging to others:

- **Authenticated Context**: Controller methods use `req.user.id` from the verified JWT instead of trusting `userId` provided in request bodies.
- **Ownership Verification**: Actions like "Claiming an Escalation" verify that the requester is a valid specialist before granting ownership.

### 4. Authentication Flow

- **JWT (JSON Web Tokens)**: All API communication is secured via JWT with `HS256` signing.
- **Stateless Verification**: Tokens are verified on every request using a centralized middleware.

## 🔍 Vulnerability Auditing

We maintain a custom security scanner (`.agent/skills/vulnerability-scanner/scripts/security_scan.py`) that performs:

- **Secret Scanning**: Scans codebase and environment files for leaked credentials.
- **Pattern Matching**: Identifies dangerous code patterns (e.g., hardcoded fallback IDs).
- **Dependency Audit**: Checks for known vulnerabilities in `npm` and `pip` packages.

## 🚀 Production Best Practices

- **Environment Isolation**: Always use distinct `.env` files for `development`, `staging`, and `production`.
- **Secrets Management**: Use tools like AWS Secrets Manager or HashiCorp Vault to inject secrets into containers at runtime.
- **HTTPS**: All production traffic must be served over TLS/SSL (Nginx handles the termination).
