# Event Hosting Platform Plan

## Goal

Build a lightweight event hosting and attendance platform for free community-style events. Organizers should be able to publish event pages, manage attendance, and run check-in at the venue. Attendees should be able to RSVP, receive a digital pass, and optionally leave feedback or contribute gallery content after the event.

The implementation target is Lovable for product generation and Supabase for backend services.

## Recommended Architecture

Use Lovable for UI generation, page flows, forms, dashboards, and role-based interfaces. Use Supabase for authentication, database, storage, and server-side enforcement.

### Stack

1. Lovable for app shell, routing, and page generation.
2. Supabase Auth for sign-in, session handling, and redirect-back flows.
3. Supabase Postgres for application data.
4. Supabase Storage for logos, cover images, and gallery uploads.
5. Supabase Edge Functions or SQL functions for waitlist promotion, QR/ticket generation, CSV export, moderation actions, and secure business logic.
6. QR code generation library for digital tickets.
7. ICS file generation for Add to Calendar.
8. Optional Supabase Realtime for live check-in counters.

## Product Scope

### Core Publishing and Hosting

1. Any signed-in user can register as a Host via a self-serve flow.
2. Host profile includes name, logo, short bio, and contact email.
3. Each Host has a public Host page.
4. Event creation supports:
   - title
   - description
   - start and end date/time
   - time zone
   - venue address or online link
   - capacity
   - cover image
5. Events support visibility modes:
   - Public
   - Unlisted
6. Events support lifecycle states:
   - Draft
   - Published
7. Event actions include:
   - Publish
   - Unpublish
   - Duplicate
8. Event editor includes a Free/Paid toggle.
9. Paid is disabled with a "Coming soon" tooltip.

### Discovery and Sharing

1. Explore page supports:
   - text search
   - date range filter
   - location filter
   - Include Past toggle
2. Upcoming events are the default view.
3. Past events display a clear Ended state.
4. Past events hide RSVP actions.
5. Event and Host pages include social preview metadata.

### RSVP and Tickets

1. RSVP requires authentication.
2. Signed-out users are redirected to sign-in and then returned to the event page.
3. Capacity is enforced.
4. Once capacity is full, new RSVPs go to a waitlist.
5. Confirmed attendees receive a unique ticket.
6. Each ticket includes a unique QR code.
7. Tickets include an Add to Calendar option.
8. Attendees can cancel RSVPs.
9. A My Tickets page shows all upcoming confirmed tickets.

### Waitlist

1. Waitlist operates FIFO.
2. When a seat opens due to cancellation, the next waitlisted attendee is promoted automatically.
3. When capacity increases, the next waitlisted attendee is promoted automatically.
4. Promotion is visible in-app to the attendee.

### Roles and Permissions

1. Each Host has two roles:
   - Host
   - Checker
2. Hosts can invite members by role using a copyable link.
3. Host role permissions:
   - create and manage events
   - approve gallery uploads
   - view dashboard
   - export CSVs
   - manage members
4. Checker role permissions:
   - access event check-in pages under the assigned Host

### Dashboard and Operations

1. Host dashboard lists Upcoming and Past events.
2. Each event shows:
   - Going count
   - Waitlist count
   - Checked-in count
3. CSV export is available for RSVPs and attendance.
4. Export columns:
   - name
   - email
   - RSVP status
   - check-in time
5. Exports must open correctly in Excel and Google Sheets.

### Check-In

1. A Checker can open the check-in page for an event.
2. Ticket codes can be entered manually.
3. QR codes are generated for tickets, but camera scanning is not required in MVP.
4. Check-in page shows live counters.
5. Duplicate check-ins are blocked.
6. The last scan can be undone.

### Community Content and Feedback

1. Attendees can leave post-event feedback after the event ends.
2. Feedback includes:
   - star rating from 1 to 5
   - optional comment
3. Attendees can upload event photos.
4. Uploaded photos require Host approval before public display.
5. Any user can report an event or photo.
6. Reported items appear in a review queue.
7. Reported items can be hidden from public view.

## Functional Requirements Mapping

### Public User Behavior

1. Unauthenticated users can browse all public events, including past events, **without being prompted to sign in**.
2. The home page and Explore page must load and display published public events immediately, with no authentication gate or redirect.
3. Individual public event pages and public Host pages are fully readable without authentication.
4. Unauthenticated users must see live availability for each published public event: `free spots = capacity - confirmed RSVPs` (never hardcoded to zero).
5. Past event pages must clearly show Ended.
6. RSVP must be hidden for ended events.
7. The only action that requires authentication is RSVP; all read paths remain open.

### Authenticated User Behavior

1. Signed-in users can register as Hosts.
2. Signed-in users can create, publish, and manage free events.
3. Signed-in users can RSVP to events.
4. After RSVP, confirmed users immediately see a unique QR ticket.
5. Signed-in users can add the event to their calendar.
6. Signed-in users can cancel RSVPs.
7. Signed-in users can view upcoming tickets on a Tickets page.
8. Signed-in users can upload gallery photos.
9. Signed-in users can leave post-event feedback after event end.
10. Signed-in users can report events or photos.

### Operational Behavior

1. Waitlist promotion happens automatically when seats open.
2. Checker can access check-in page for assigned Host events.
3. Checker can enter codes manually.
4. Checker can view live counters.
5. Duplicate scans are blocked.
6. Checker can undo the last scan.
7. Gallery uploads remain hidden until approved.
8. Reported items appear in a review list and can be hidden.
9. My Events is visible to users with roles and aggregates events with filters and role-appropriate actions.
10. Event editor shows Free/Paid with Paid disabled and explanatory tooltip.

## Delivery Phases

## Phase 0: Foundation

Define the structure before generating large amounts of UI.

### Decisions

1. Free events only in MVP.
2. Paid remains visible but disabled.
3. QR generation is included, but camera scanning is deferred.
4. Events belong to a Host entity, not directly to an individual user.
5. Critical state changes are enforced server-side.

### Deliverables

1. Sitemap.
2. Data model.
3. Role matrix.
4. State machines for event lifecycle, RSVP, ticketing, check-in, moderation, and reports.

## Phase 1: Auth, Hosts, and Event CRUD

### Features

1. Sign up, sign in, sign out.
2. User profile.
3. Become a Host flow.
4. Host profile editing.
5. Host public page.
6. Event editor with all required fields.
7. Publish, Unpublish, and Duplicate actions.
8. Visibility handling for Public and Unlisted.
9. Free/Paid toggle with disabled Paid option.

### Acceptance Criteria

1. A signed-in user can register as a Host.
2. A Host can create a Draft event.
3. A Host can publish and unpublish events.
4. A Host can duplicate an event.
5. Public published events appear on Explore.
6. Unlisted events are accessible only by direct link.

## Phase 2: Discovery and Public Event Experience

### Features

1. Explore page.
2. Search by text.
3. Filter by date range.
4. Filter by location.
5. Include Past toggle.
6. Ended state on cards and event pages.
7. Public Host page links.
8. Social preview metadata placeholders.

### Event Page Information Architecture

The event detail page must include three visible content sections (tabs or anchored sections):

1. About this event
   - title, description, date/time, time zone, location/online link, Host, RSVP area, and live availability (`X free spots` or `Sold out`).
2. Gallery
   - public gallery of approved photos only.
   - signed-in attendees can upload photos from this section.
   - if there are no approved photos yet, show an empty state instead of hiding the section.
3. Reviews
   - post-event feedback list (rating + optional comment).
   - feedback form appears only after the event ends for eligible attendees.
   - before event end, show a "Reviews open after the event ends" helper message.

### Acceptance Criteria

1. Signed-out users can browse public events.
2. Past events are clearly labeled Ended.
3. RSVP is hidden for ended events.
4. Every event detail page shows About this event, Gallery, and Reviews sections in the UI.
5. Gallery and Reviews sections are visible to signed-out users, while write actions inside them (upload, submit review) require sign-in.
6. Missing content never removes the section; empty states are shown instead.
7. Event cards and event detail pages show correct live availability for signed-out users (`capacity - confirmed`), not an always-empty state.

## Phase 3: RSVP, Capacity, Waitlist, and Tickets

### Features

1. RSVP requires sign-in.
2. Redirect-back to the originating event page after sign-in.
3. If capacity is available, RSVP becomes confirmed.
4. If capacity is full, RSVP becomes waitlisted.
5. Confirmed RSVP creates a ticket.
6. Ticket includes unique code and QR representation.
7. Ticket page includes Add to Calendar.
8. Attendee can cancel RSVP.
9. My Tickets page lists upcoming confirmed tickets.
10. Automatic waitlist promotion on cancellation or capacity increase.
11. Promotion is shown in-app.

### Acceptance Criteria

1. Signed-in users can RSVP.
2. Confirmed users see their ticket immediately.
3. Full events place new users on waitlist.
4. Canceling a confirmed RSVP promotes the oldest waitlisted attendee.
5. Capacity increase also triggers promotion correctly.

## Phase 4: Roles, Invites, and My Events

### Features

1. Host and Checker roles.
2. Invite links with role assignment.
3. Invite acceptance flow.
4. My Events page.
5. Filters by Host, date range, and text search.
6. Role-appropriate quick actions.

### Acceptance Criteria

1. Host can invite another user as Host or Checker.
2. Checker only sees check-in actions.
3. Users with roles see all relevant events in My Events.

## Phase 5: Dashboard and CSV Export

### Features

1. Host dashboard with Upcoming and Past sections.
2. Event metrics for Going, Waitlist, and Checked-in.
3. RSVP export.
4. Attendance export.
5. CSV formatting that works in Excel and Google Sheets.

### Acceptance Criteria

1. Host can view per-event metrics.
2. Host can export CSV successfully.
3. CSV opens correctly in Excel and Google Sheets.

## Phase 6: Check-In Operations

### Features

1. Event-specific check-in page.
2. Manual code entry.
3. Valid ticket lookup.
4. Duplicate check-in prevention.
5. Live counters.
6. Undo last scan.
7. Check-in audit trail.

### Acceptance Criteria

1. Checker can check in a valid attendee.
2. Duplicate check-ins are blocked.
3. Undo reverses the last successful check-in.
4. Counters stay consistent.

## Phase 7: Feedback, Gallery, and Reporting

### Features

1. Post-event feedback form.
2. Rating and optional comment.
3. Gallery uploads.
4. Approval workflow for gallery items.
5. Report event flow.
6. Report photo flow.
7. Review queue.
8. Hide moderation action.

### Acceptance Criteria

1. Feedback is only available after the event ends.
2. Gallery uploads are hidden until approved.
3. Reported items appear in a review queue.
4. Hidden content no longer appears publicly.

### Gallery Approval Workflow

**Where Hosts Approve Images:**

1. Hosts access the gallery review page at `/host/:hostSlug/gallery-review`.
2. This page displays all pending gallery uploads for the Host's events, grouped by event.
3. Each pending upload shows:
   - thumbnail or preview of the image
   - name of the attendee who uploaded it
   - the event name
   - upload timestamp
   - approve, reject, and hide action buttons

**Approval Actions:**

1. **Approve** — changes status from `pending` to `approved`, making the image publicly visible on the event's gallery.
2. **Reject** — changes status from `pending` to `rejected`, and the image is not shown to attendees or the public.
3. **Hide** — (for approved images) changes status to `hidden`, removing it from the public gallery; useful if an approved image is later reported or becomes inappropriate.

**Attendee Notification:**

1. When an upload is approved, the attendee receives optional in-app notification or can see it on the event gallery page.
2. When an upload is rejected, the attendee may receive notification explaining the rejection (if configured).

**Reported Images:**

1. If an image is reported, it moves to the reports review queue (not the gallery approval queue).
2. The Host can access reports at `/host/:hostSlug/reports`.
3. The Host can review the report, view the image, and decide to hide it or dismiss the report.

## Data Model

## Core Tables

### profiles

1. id
2. full_name
3. email
4. avatar_url
5. created_at

### hosts

1. id
2. slug
3. name
4. logo_url
5. bio
6. contact_email
7. created_by
8. created_at

### host_members

1. id
2. host_id
3. user_id
4. role (`host`, `checker`)
5. invited_by
6. created_at

### host_invites

1. id
2. host_id
3. role
4. token
5. expires_at
6. created_by
7. accepted_by
8. accepted_at

### events

1. id
2. host_id
3. slug
4. title
5. description
6. starts_at
7. ends_at
8. timezone
9. venue_type (`physical`, `online`)
10. venue_address
11. online_url
12. capacity
13. cover_image_url
14. visibility (`public`, `unlisted`)
15. state (`draft`, `published`, `unpublished`)
16. pricing_mode (`free`, `paid`)
17. created_by
18. duplicated_from_event_id
19. created_at
20. updated_at

### rsvps

1. id
2. event_id
3. user_id
4. status (`confirmed`, `waitlisted`, `canceled`)
5. queue_position
6. promoted_at
7. canceled_at
8. created_at

### tickets

1. id
2. event_id
3. rsvp_id
4. user_id
5. ticket_code
6. qr_payload
7. issued_at

### check_ins

1. id
2. event_id
3. ticket_id
4. checked_in_by
5. checked_in_at
6. undone_by
7. undone_at
8. is_active

### feedback

1. id
2. event_id
3. user_id
4. rating
5. comment
6. created_at

### gallery_uploads

1. id
2. event_id
3. user_id
4. image_url
5. status (`pending`, `approved`, `hidden`, `rejected`)
6. reviewed_by
7. reviewed_at
8. created_at

### reports

1. id
2. reporter_user_id
3. target_type (`event`, `photo`)
4. target_id
5. reason
6. details
7. status (`open`, `reviewed`, `hidden`, `dismissed`)
8. resolved_by
9. resolved_at
10. created_at

## Derived Views

1. Event stats view.
2. My Events aggregation view.
3. Approved public gallery view.

## Core Business Rules

### Event Rules

1. Only Host-role members can create and manage events.
2. Paid cannot be selected in MVP.
3. Public published events appear in Explore.
4. Unlisted published events do not appear in Explore.
5. Past events cannot accept RSVPs.

### RSVP Rules

1. Only one active RSVP per user per event.
2. If confirmed count is below capacity, RSVP becomes confirmed.
3. Otherwise, RSVP becomes waitlisted.
4. Waitlist position is FIFO.
5. Cancellation or capacity increase can trigger promotion.
6. Promotion must happen transactionally on the server.

### Ticket Rules

1. Ticket code must be unique.
2. Only confirmed attendees get tickets.
3. Ticket includes QR data and human-readable code.
4. Calendar file is generated from event metadata.

### Check-In Rules

1. Only Host or Checker roles for the event's Host can check in attendees.
2. Duplicate active check-ins are blocked.
3. Undo affects only the most recent successful check-in action.
4. Live counters reflect active check-ins only.

### Content Rules

1. Feedback is only available after event end.
2. Feedback is limited to eligible attendees.
3. Gallery items are public only when approved.
4. Hidden reported items are excluded from public views.

## Permissions Matrix

### Public

1. Read published public events — no authentication required.
2. Read published unlisted events by direct link — no authentication required.
3. Read public Host pages — no authentication required.
4. Read approved gallery items — no authentication required.
5. Read event availability counters (`capacity`, confirmed RSVP count, free spots) — no authentication required.
6. No route in the public browsing path (`/`, `/explore`, `/events/:slug`, `/hosts/:slug`) may redirect unauthenticated users to a sign-in page.

### Authenticated Users

1. Manage own profile.
2. Register as Host.
3. Manage own RSVPs.
4. View own tickets.
5. Submit feedback for eligible events.
6. Upload gallery photos.
7. Submit reports.

### Host Role

1. Manage Host profile.
2. Create and manage events.
3. Publish, unpublish, and duplicate events.
4. View dashboard.
5. Export CSVs.
6. Review gallery uploads.
7. Review reports.
8. Invite and manage members.

### Checker Role

1. Access check-in pages for assigned Host events.
2. Enter manual codes.
3. View live counters.
4. Undo the last scan.

## Critical Implementation Note: No Auth Gate on Public Routes

This is the single most common misconfiguration in Lovable and Supabase-backed apps.

The following routes must never redirect to sign-in and must render fully for unauthenticated sessions:

1. `/` — home page must display events.
2. `/explore` — full Explore page with search and filters.
3. `/events/:slug` — complete event detail page including cover image, description, date, location, and host.
4. `/hosts/:slug` — complete Host public profile page.

To enforce this in Supabase:

1. RLS on the `events` table must include a policy allowing `SELECT` for `anon` (unauthenticated) role on rows where `state = 'published'` and `visibility = 'public'`.
2. RLS on the `hosts` table must allow `SELECT` for `anon` on all rows.
3. RLS on `gallery_uploads` must allow `SELECT` for `anon` where `status = 'approved'`.
4. Expose an anon-readable source for availability counts (for example, an `event_stats` view with `capacity`, `confirmed_count`, and computed `free_spots`) and add an anon `SELECT` policy for it.
5. Do not wrap the Explore or Event page data-fetching calls in any auth check. Auth state should only gate the RSVP action, not the page load.
6. In Lovable, confirm that page-level auth guards (`requireAuth`, `ProtectedRoute`, or equivalent) are **not** applied to these routes.

## Route Map

### Public Routes

1. `/`
2. `/explore`
3. `/events/:slug`
4. `/hosts/:slug`
5. `/signin`
6. `/signup`

### Authenticated Routes

1. `/tickets`
2. `/my-events`
3. `/become-host`
4. `/invite/:token`

### Host Operations Routes

1. `/host/:hostSlug/dashboard`
2. `/host/:hostSlug/events/new`
3. `/host/:hostSlug/events/:eventId/edit`
4. `/host/:hostSlug/events/:eventId/check-in`
5. `/host/:hostSlug/gallery-review`
6. `/host/:hostSlug/reports`
7. `/host/:hostSlug/members`

## Lovable Build Strategy

Do not generate everything in one prompt. Split work into targeted Lovable prompts that align with stable backend contracts.

### Prompt 1: Foundation and Core Pages

1. App shell.
2. Auth pages.
3. Host registration flow.
4. Host public page.
5. Event create and edit pages.
6. Event publish and unpublish states.
7. Free/Paid toggle with Paid disabled.

### Prompt 2: Explore and Public Discovery

1. Explore page.
2. Search and filters.
3. Ended state UI.
4. Social preview placeholders.

### Prompt 3: RSVP, Tickets, and My Tickets

1. Sign-in redirect-back behavior.
2. Confirmed and waitlist flows.
3. Ticket page and ticket display.
4. Add to Calendar UI.

### Prompt 4: Roles, Invites, Dashboard, and My Events

1. Membership management.
2. Invite link flows.
3. Dashboard views.
4. My Events page.

### Prompt 5: Check-In Operations

1. Event check-in page.
2. Manual code entry.
3. Counters and undo action.

### Prompt 6: Gallery, Feedback, and Reports

1. Feedback flows.
2. Gallery upload and approval.
3. Reporting and review queue.

## Recommended Build Order

1. Authentication and profiles.
2. Host registration and Host public page.
3. Event CRUD with draft and publish workflows.
4. Explore and public event pages.
5. RSVP, capacity, waitlist, and promotion logic.
6. Ticket generation and Add to Calendar.
7. My Tickets page.
8. Roles, invite flow, and My Events.
9. Host dashboard and CSV exports.
10. Checker check-in page.
11. Feedback, gallery approval, and reporting.
12. Social metadata and polish.

## Testing Plan

### Core Scenarios

1. Browse public events while signed out.
2. Click RSVP while signed out and return to the same event page after sign-in.
3. Publish a public event and verify it appears in Explore.
4. Publish an unlisted event and verify it does not appear in Explore.
5. Fill event capacity and verify the next RSVP is waitlisted.
6. Cancel a confirmed RSVP and verify the oldest waitlisted attendee is promoted.
7. Increase capacity and verify promotion occurs automatically.
8. View My Tickets and confirm only upcoming confirmed tickets are shown.
9. Check in a valid ticket and verify counters update.
10. Enter the same code twice and verify duplicate check-in is blocked.
11. Undo the last check-in and verify counters roll back.
12. Attempt to leave feedback before event end and verify rejection.
13. Leave feedback after event end and verify success.
14. Upload a gallery photo and verify it remains hidden until approved.
15. Report an event or photo and verify it appears in a review queue.
16. Hide a reported item and verify it disappears publicly.
17. Export CSV and verify it opens in Excel and Google Sheets.

### Edge Cases

1. Event becomes ended while page is already open.
2. Multiple users RSVP at near-capacity simultaneously.
3. Two cancellations occur close together.
4. Checker attempts to access another Host's event.
5. Invite link is reused or expired.
6. Event duplication resets fields that should not carry over.

## Risks and Constraints

1. Waitlist promotion must be transactional and server-side.
2. Roles and permissions must be enforced with Supabase RLS, not just hidden UI.
3. CSV export formatting must be validated against Excel specifically.
4. Unlisted events must never leak into Explore or public search.
5. Social preview metadata may require deployment-aware handling if routes are client-rendered.
6. Ticket code generation must be sufficiently unguessable.

## MVP Definition

The MVP should include:

1. Public browsing and Explore.
2. Authentication and redirect-back RSVP flow.
3. Host registration and public Host page.
4. Event CRUD with publish, unpublish, and duplicate actions.
5. Free-only events with Paid visible but disabled.
6. RSVP, capacity enforcement, waitlist, and promotion.
7. Tickets with QR and Add to Calendar.
8. My Tickets.
9. Host dashboard with core stats.
10. Checker manual check-in with undo.
11. My Events.
12. Post-event feedback.
13. Gallery upload with approval.
14. Reporting and hide flow.

## Suggested Next Documents

After this plan, create two supporting documents:

1. A Lovable-ready product spec prompt describing screens, roles, and UI states.
2. A Supabase backend plan covering schema, RLS, functions, and server-side workflows.