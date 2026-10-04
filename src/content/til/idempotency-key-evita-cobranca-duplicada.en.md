---
slug: idempotency-key-evita-cobranca-duplicada
title: Idempotency keys prevent duplicate charges
kicker: ENGINEERING
date: 2026-10-04
excerpt: When the response gets lost on the network, a retry can charge twice. One unique key per intent solves it.
published: true
locale: en
---

I learned that when a payment fails with "connection error", the client can't tell whether the charge happened or only the response got lost. Retrying is the right move, but without protection it turns into a duplicate charge.

The fix is for the client to generate an idempotency key for each payment intent and resend the same key on every attempt:

```http
POST /payments HTTP/1.1
Idempotency-Key: 8f14e45f-ceea-4c7a-9a1b-3e2d5c6f7a80
```

The server records the key before charging. If it shows up again, the server returns the saved response instead of charging again. The important detail is storing the key atomically (a UNIQUE constraint in the database); otherwise two simultaneous clicks can still slip through together.
