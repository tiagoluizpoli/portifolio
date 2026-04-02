# Contract: Zenith Server Functions

This document defines the secure server-only API for the Zenith Hub, built with TanStack Start `createServerFn`.

## Auth: `validateSession`
Internal middleware contract for all secure paths.

| Method | Input | Output | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `sessionId: string` | `user: Owner | Error` | Validates session with Appwrite. |

---

## Portfolio: `updateProject`
Standardized write access for project entries.

| Method | Input | Output | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `Project` (Partial) | `Project | Error` | Mutates project state in TablesDB. |

---

## Analytics: `logHeartbeat`
Background session tracking.

| Method | Input | Output | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `AnalyticsEntry` | `OK | Error` | Process and store 30s heartbeat. |

---

## Security Invariants

1.  **Validation**: Every function MUST use `zodValidator` for input sanitization.
2.  **Context**: Functions access `serverContext()` to verify the authenticated user ID before executing DB calls.
3.  **Isolation**: These functions are strictly logic-centric and must not contain UI presentation code.
