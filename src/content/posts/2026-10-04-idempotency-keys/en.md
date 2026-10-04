---
slug: idempotency-keys
translationKey: idempotency-keys
title: Idempotency keys: how to avoid charging your customer twice
kicker: ENGINEERING
date: 2026-10-04
readingTime: 7 MIN READ
author: kawhan
excerpt: Learn what idempotency keys are, why they exist, and how to use them so a repeated request never turns into a duplicate charge.
cover: https://images.unsplash.com/photo-1556740720-776b84291f8e?auto=format&fit=crop&w=1200&q=80
coverAlt: Person holding a card payment terminal during a purchase
published: true
locale: en
---

Picture this: you're buying sneakers on your phone, you tap "Pay" and the screen keeps spinning. Your mobile signal drops. After a few seconds you see "Connection error". You tap "Pay" again. This time it works.

The next day, your statement shows two charges.

What happened? And, more importantly, how can a system protect itself from this? That's where idempotency keys come in.

## The problem: the network lies

When the app sends the payment to the server, three things can happen:

- The request never reaches the server. Nothing was charged.
- The request arrives, the server charges the card, but the response gets lost on the way back.
- Everything works normally.

The problem is that, from the app's point of view, the first two cases look identical: all it sees is an error. It has no way of knowing whether the charge happened.

```text
App                       Server
 |  --- POST /payments --->    |
 |                             |  charges $60 ✅
 |  <--- 201 Created ----  ✗   |  (response lost)
 |                             |
 |  "Connection error"         |
 |  --- POST /payments --->    |
 |                             |  charges $60 again ❌
```

Trying again (the famous retry) is the right thing to do when the network fails. But without care, a retry becomes a duplicate charge.

## First: what is idempotency?

An operation is idempotent when doing it once or many times has the same effect.

Think of an elevator button. Press it once and the elevator comes. Press it ten times, impatiently, and the elevator still comes. Just once. Pressing again doesn't summon a second elevator.

Now think of a vending machine: every time you press the button (with credit), a can drops. That is not idempotent.

In HTTP, some methods are idempotent by definition:

- GET: yes, because it only reads data.
- PUT: yes, because it says "make the resource exactly like this".
- DELETE: yes, because deleting something already deleted changes nothing.
- POST: no, because it says "create something new", and each call creates one more.

Creating a payment is a POST. So we need some extra help to make it safe against repetition.

## The solution: the idempotency key

The idea is simple: the client generates a unique identifier for each payment intent and sends it with the request. If the same request arrives again with the same identifier, the server recognizes it ("I've already done this one") and returns the original response instead of charging again.

That identifier is the idempotency key. It usually travels in an HTTP header called Idempotency-Key:

```http
POST /payments HTTP/1.1
Content-Type: application/json
Idempotency-Key: 8f14e45f-ceea-4c7a-9a1b-3e2d5c6f7a80

{
  "amount": 6000,
  "currency": "USD",
  "card": "tok_visa_123"
}
```

The key is usually a UUID generated when the user decides to pay. The crucial part: if the app needs to retry, it reuses the same key.

With that, the earlier diagram becomes:

```text
App                                Server
 |  --- POST (key: 8f14...) --->    |
 |                                  |  charges $60 ✅, stores response
 |  <--- 201 Created --------  ✗    |  (response lost)
 |                                  |
 |  --- POST (key: 8f14...) --->    |
 |                                  |  "I've seen this key!"
 |  <--- 201 Created (same one) --  |  no second charge ✅
```

The user is charged only once, and the app gets the response it had lost.

## How the server does it

The server logic, in pseudo-code, looks roughly like this:

```text
function createPayment(request):
    key = request.headers["Idempotency-Key"]

    if key is missing:
        return error 400 "Idempotency-Key is required"

    record = db.find(key)

    if record exists:
        if record.body != request.body:
            return error 422 "Key reused with different data"
        if record.status == "processing":
            return error 409 "Request still in progress"
        return record.savedResponse          // no second charge!

    db.save(key, status = "processing", body = request.body)

    response = chargeCard(request.body)

    db.update(key, status = "done", savedResponse = response)
    return response
```

In short: before doing anything, the server writes the key down. If it shows up again, the server doesn't repeat the work; it just returns what it already answered.

## The details that matter

The idea is simple, but a few details separate a good implementation from one that only looks like it works.

The client generates the key. The key must exist before the first attempt, so every attempt can use the same one. That's why the client (the app, the frontend, the calling service) generates it, not the server. And note: the key represents one intent. A new purchase gets a new key; a retry of the same purchase uses the same key.

Same key with different data is an error. If the same key arrives with a different body (say, $60 the first time and $100 the second), something is wrong on the client. The server shouldn't guess which one is right: it rejects the request.

Watch out for two requests at the same time. If the user double-clicks so fast that both requests arrive together, both may look up the key at the same moment, conclude it doesn't exist, and charge. That's why saving the key must be atomic. In a database, this is usually a UNIQUE constraint on the key column: only one request manages to insert it, and the other gets an error and responds "in progress".

Keys don't last forever. Storing every key forever wastes space for no reason. It's common to set an expiration, for example 24 hours. After that the key can be deleted: nobody retries yesterday's payment.

It's not just for payments. Payments are the clearest example, but the same idea applies to any operation that must not happen twice: creating an order, sending an email, transferring money, issuing an invoice.

## Summary

- Networks fail, and the client can't tell whether the operation happened. So it retries.
- An idempotent operation has the same effect whether done once or many times.
- POST isn't idempotent by nature; the idempotency key fixes that.
- The client generates one unique key per intent and reuses the same key on retries.
- The server records the key before acting and, if it repeats, returns the saved response instead of running again.
- Watch out for: client-generated keys, rejecting different data, guarding against concurrent requests, and setting an expiration.

Next time the payment screen spins and you tap "Pay" again, you'll know: if the system was built well, an idempotency key is making sure you only pay once.

Cover photo: Blake Wisz, on Unsplash (unsplash.com/@blakewisz).
