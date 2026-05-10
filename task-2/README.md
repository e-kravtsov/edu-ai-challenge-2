# Happenin — Usage Guide
A walk-through of the four main flows: **Publish → RSVP → Ticket → Check-in**.
Each section assumes you're signed in (top-right avatar → Sign In / Get Started).
---
## 1. Publish an event
Goal: get a draft event in front of attendees.
1. **Become a host.** Open the avatar menu → **Become a Host**. Fill in host name and slug; this creates your host page at `/hosts/<slug>`.
2. **Open your host dashboard.** Avatar menu → **My Hosts** → pick the host. You land on `/host/<slug>/dashboard` with Upcoming / Past events.
3. **Create the event.** Click **New Event**. Provide:
   - Title, description, cover image
   - Start / end date-time and timezone
   - Venue (physical address or online URL)
   - Capacity
   - Visibility (public / unlisted)
4. **Save as draft.** The event appears on the dashboard with a `draft` badge. Only host members can see it.
5. **Publish.** Open the event → **Edit** → set state to **published**. It now appears on `/explore` and the public host page.
> Tip: use **Duplicate** on a past event to clone settings for a recurring meetup.
---
## 2. RSVP as an attendee
Goal: an attendee secures a spot (or joins the waitlist).
1. Browse `/explore` or open a host page and pick an event.
2. Click **RSVP**. The server function `handle_rsvp`:
   - Confirms the spot if the event is below capacity → status `confirmed`.
   - Otherwise adds you to the waitlist with a queue position → status `waitlisted`.
3. You'll see your status on the event page. The avatar menu → **My Tickets** and **My Events** both reflect the new RSVP.
4. **Cancel anytime** from the event page. If you were confirmed, the next person on the waitlist is auto-promoted (`promote_waitlist`) and issued a ticket.
---
## 3. Get your ticket
Goal: every confirmed attendee has a unique code to present at the door.
1. As soon as your RSVP becomes `confirmed` (immediately, or after waitlist promotion), a ticket is issued automatically.
2. Open **My Tickets** from the avatar menu. Each ticket shows:
   - Event title, date and venue
   - A short **ticket code** (e.g. `A1B2C3D4E5F6`)
   - A **QR code** that encodes the same code
3. Bring either the code or the QR on event day — both resolve to the same ticket.
> Tickets are immutable: they're tied to one RSVP and one user, and can't be transferred.
---
## 4. Check attendees in
Goal: a host or checker marks people as present at the event.
1. **Get access.** A host opens `/host/<slug>/members` → **Generate Link**, picks the **Checker** role, and shares the invite URL. The recipient signs in, opens the link, and joins as a checker.
2. **Open check-in.** From the host dashboard, click **Check-In** on the event. Both hosts and checkers can access this page.
3. **Enter codes.**
   - Type or paste the ticket code (case-insensitive) and press **Enter**, or
   - Read the code off the attendee's QR.
4. **Live counters** update instantly: *Checked In* / *Total Going*.
5. **Duplicate protection.** Re-entering the same code shows "Already checked in" instead of double-counting.
6. **Undo last.** A button shows the most recent code — one tap deactivates that check-in if it was a mistake.
> Checkers only see the check-in page for the host that invited them; they can't edit events or members.
---
## Quick navigation cheatsheet
| You want to… | Go to |
|---|---|
| Discover events | `/explore` |
| See a host's page | `/hosts/<slug>` |
| Manage your hosts | Avatar → **My Hosts** |
| See everything you're involved in | Avatar → **My Events** |
| See your tickets | Avatar → **My Tickets** |
| Run check-in | Host dashboard → **Check-In** on the event |
| Invite a checker / co-host | Host dashboard → **Members** → **Generate Link** |