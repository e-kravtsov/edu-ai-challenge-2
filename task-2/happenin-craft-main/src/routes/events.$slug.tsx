import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { formatEventDate, formatEventTime } from "@/lib/mock-data";
import type { Database } from "@/integrations/supabase/types";

type Event = Database["public"]["Tables"]["events"]["Row"];

export const Route = createFileRoute("/events/$slug")({
  component: EventDetailPage,
  head: () => ({
    meta: [{ title: "Event — Happenin" }],
  }),
});

function EventDetailPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [hostName, setHostName] = useState("");
  const [hostSlug, setHostSlug] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);
  const [goingCount, setGoingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: evts } = await supabase.from("events").select("*").eq("slug", slug).eq("state", "published");
      const evt = evts?.[0];
      if (!evt) { setLoading(false); return; }
      setEvent(evt);

      const { data: host } = await supabase.from("hosts").select("name, slug").eq("id", evt.host_id).single();
      setHostName(host?.name || "");
      setHostSlug(host?.slug || "");

      const { count } = await supabase.from("rsvps").select("*", { count: "exact", head: true }).eq("event_id", evt.id).eq("status", "confirmed");
      setGoingCount(count || 0);

      if (user) {
        const { data: rsvp } = await supabase.from("rsvps").select("status").eq("event_id", evt.id).eq("user_id", user.id).neq("status", "canceled").maybeSingle();
        setRsvpStatus(rsvp?.status || null);
      }
      setLoading(false);
    })();
  }, [slug, user]);

  const handleRsvp = async () => {
    if (!user) { window.location.href = `/signin?redirect=/events/${slug}`; return; }
    if (!event) return;
    setRsvpLoading(true);
    const { data, error } = await supabase.rpc("handle_rsvp", { p_event_id: event.id, p_user_id: user.id });
    if (error) { toast.error(error.message); setRsvpLoading(false); return; }
    const result = data as unknown as { status?: string; error?: string };
    if (result.error) { toast.error(result.error); setRsvpLoading(false); return; }
    setRsvpStatus(result.status || "confirmed");
    if (result.status === "confirmed") { setGoingCount(prev => prev + 1); toast.success("You're in! Check your tickets."); }
    else toast.info("You've been added to the waitlist.");
    setRsvpLoading(false);
  };

  const handleCancel = async () => {
    if (!user || !event) return;
    setRsvpLoading(true);
    await supabase.from("rsvps").update({ status: "canceled" as const, canceled_at: new Date().toISOString() }).eq("event_id", event.id).eq("user_id", user.id);
    setRsvpStatus(null);
    setGoingCount(prev => Math.max(0, prev - 1));
    await supabase.rpc("promote_waitlist", { p_event_id: event.id });
    toast.success("RSVP cancelled");
    setRsvpLoading(false);
  };

  if (loading) return <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></main></div>;

  if (!event) return (
    <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 flex items-center justify-center"><div className="text-center"><h1 className="text-4xl font-bold text-foreground">Event not found</h1><Link to="/explore"><Button variant="default" className="mt-6">Browse Events</Button></Link></div></main><Footer /></div>
  );

  const isPast = new Date(event.ends_at) < new Date();
  const isFull = goingCount >= event.capacity;
  const spotsLeft = event.capacity - goingCount;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero cover */}
        <div className="relative aspect-[3/1] max-h-[400px] w-full overflow-hidden bg-muted">
          {event.cover_image_url ? (
            <img src={event.cover_image_url} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-warm text-6xl">🎉</div>
          )}
          {isPast && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/50">
              <Badge variant="secondary" className="bg-background/90 text-foreground text-sm font-semibold px-4 py-1.5">This event has ended</Badge>
            </div>
          )}
        </div>

        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="lg:flex lg:gap-12">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="gallery">Gallery</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                {/* ── About tab ── */}
                <TabsContent value="about">
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className="bg-success text-success-foreground">Free</Badge>
                    {event.venue_type === "online" && <Badge variant="outline">Online</Badge>}
                    {isPast && <Badge variant="secondary">Ended</Badge>}
                    {!isPast && isFull && <Badge variant="destructive">Full</Badge>}
                  </div>
                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{event.title}</h1>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">📅</div>
                      <div>
                        <p className="font-medium text-foreground">{formatEventDate(event.starts_at)}</p>
                        <p className="text-sm text-muted-foreground">{formatEventTime(event.starts_at)} — {formatEventTime(event.ends_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">📍</div>
                      <div>
                        <p className="font-medium text-foreground">{event.venue_type === "online" ? "Online Event" : event.venue_address}</p>
                        {event.venue_type === "online" && <p className="text-sm text-muted-foreground">Link shared after RSVP</p>}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">👥</div>
                      <div>
                        <p className="font-medium text-foreground">{goingCount} going</p>
                        <p className="text-sm text-muted-foreground">{isFull ? "Waitlist available" : `${spotsLeft} spots left`} · {event.capacity} capacity</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h2 className="text-lg font-semibold text-foreground">About this event</h2>
                    <p className="mt-3 text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
                  </div>

                  {user && <ReportButton eventId={event.id} userId={user.id} />}
                </TabsContent>

                {/* ── Gallery tab ── */}
                <TabsContent value="gallery">
                  <GallerySection eventId={event.id} isPast={isPast} user={user} />
                </TabsContent>

                {/* ── Reviews tab ── */}
                <TabsContent value="reviews">
                  <ReviewsSection eventId={event.id} isPast={isPast} user={user} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="mt-8 lg:mt-0 lg:w-72 shrink-0">
              <div className="sticky top-20 space-y-4">
                {!isPast && (
                  <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                    <p className="text-sm font-medium text-muted-foreground">{isFull ? "Event is full" : `${spotsLeft} spots remaining`}</p>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-hero transition-all" style={{ width: `${Math.min((goingCount / event.capacity) * 100, 100)}%` }} />
                    </div>
                    {rsvpStatus === "confirmed" ? (
                      <div className="mt-4 space-y-2">
                        <Badge className="w-full justify-center bg-success text-success-foreground py-2">✓ You're going!</Badge>
                        <Link to="/tickets"><Button variant="outline" className="w-full" size="sm">View Ticket</Button></Link>
                        <Button variant="ghost" className="w-full text-destructive" size="sm" onClick={handleCancel} disabled={rsvpLoading}>Cancel RSVP</Button>
                      </div>
                    ) : rsvpStatus === "waitlisted" ? (
                      <div className="mt-4 space-y-2">
                        <Badge variant="secondary" className="w-full justify-center py-2">On waitlist</Badge>
                        <Button variant="ghost" className="w-full text-destructive" size="sm" onClick={handleCancel} disabled={rsvpLoading}>Leave Waitlist</Button>
                      </div>
                    ) : (
                      <Button variant={isFull ? "outline" : "hero"} className="mt-4 w-full" size="lg" onClick={handleRsvp} disabled={rsvpLoading}>
                        {rsvpLoading ? "Processing..." : isFull ? "Join Waitlist" : "RSVP — Free"}
                      </Button>
                    )}
                  </div>
                )}
                <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hosted by</p>
                  <Link to="/hosts/$hostSlug" params={{ hostSlug }} className="mt-3 flex items-center gap-3 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-hero text-sm font-bold text-primary-foreground">{hostName.charAt(0)}</div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">{hostName}</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ─── Gallery Section (always rendered, never hidden) ─── */
function GallerySection({ eventId, isPast, user }: { eventId: string; isPast: boolean; user: { id: string } | null }) {
  const [photos, setPhotos] = useState<Array<{ id: string; image_url: string; user_id: string }>>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase
      .from("gallery_uploads")
      .select("id, image_url, user_id")
      .eq("event_id", eventId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPhotos(data || []));
  }, [eventId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${user.id}/${eventId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file);
    if (uploadError) { toast.error(uploadError.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(path);

    const { error: dbError } = await supabase.from("gallery_uploads").insert({
      event_id: eventId,
      user_id: user.id,
      image_url: urlData.publicUrl,
      status: "pending",
    });

    if (dbError) toast.error(dbError.message);
    else toast.success("Photo uploaded! It will appear after review.");
    setUploading(false);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Photo Gallery</h2>
        {user && isPast && (
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            <Button variant="outline" size="sm" asChild disabled={uploading}>
              <span>{uploading ? "Uploading..." : "📷 Add Photo"}</span>
            </Button>
          </label>
        )}
        {!user && isPast && (
          <Link to="/signin">
            <Button variant="outline" size="sm">Sign in to upload</Button>
          </Link>
        )}
      </div>
      {photos.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="aspect-square overflow-hidden rounded-lg">
              <img src={photo.image_url} alt="Event photo" className="h-full w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
          <p className="text-3xl">📷</p>
          <p className="mt-2 text-sm font-medium text-foreground">No photos yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isPast ? "Be the first to share a photo from this event!" : "Photos can be uploaded after the event ends."}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Reviews Section (always rendered, never hidden) ─── */
function ReviewsSection({ eventId, isPast, user }: { eventId: string; isPast: boolean; user: { id: string } | null }) {
  const [reviews, setReviews] = useState<Array<{ id: string; rating: number; comment: string | null; created_at: string; user_id: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("feedback")
      .select("id, rating, comment, created_at, user_id")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setReviews(data || []); setLoading(false); });
  }, [eventId]);

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="mt-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Reviews</h2>
        {avgRating && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="text-foreground font-semibold">{avgRating}</span>
            <span>★</span>
            <span>({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
          </div>
        )}
      </div>

      {/* Write form or helper message */}
      {isPast ? (
        <FeedbackForm eventId={eventId} user={user} onSubmitted={(r) => setReviews(prev => [r, ...prev])} />
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center">
          <p className="text-sm text-muted-foreground">⏳ Reviews open after the event ends</p>
        </div>
      )}

      {/* Review list */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading reviews...</p>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
          <p className="text-3xl">💬</p>
          <p className="mt-2 text-sm font-medium text-foreground">No reviews yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isPast ? "Be the first to leave a review!" : "Reviews will appear here after the event."}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Feedback Form (inside Reviews tab, only for past events) ─── */
function FeedbackForm({ eventId, user, onSubmitted }: { eventId: string; user: { id: string } | null; onSubmitted: (r: { id: string; rating: number; comment: string | null; created_at: string; user_id: string }) => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user) { setChecked(true); return; }
    supabase.from("feedback").select("id").eq("event_id", eventId).eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setSubmitted(true); setChecked(true); });
  }, [eventId, user]);

  if (!checked) return null;

  if (!user) return (
    <div className="rounded-lg border border-border bg-card p-4 text-center">
      <p className="text-sm text-muted-foreground">
        <Link to="/signin" className="text-primary hover:underline">Sign in</Link> to leave a review
      </p>
    </div>
  );

  if (submitted) return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">✓ You've submitted feedback for this event</p>
    </div>
  );

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    const { data, error } = await supabase.from("feedback").insert({ event_id: eventId, user_id: user.id, rating, comment: comment || null }).select("id, rating, comment, created_at, user_id").single();
    if (error) toast.error(error.message);
    else { setSubmitted(true); toast.success("Thanks for your feedback!"); if (data) onSubmitted(data); }
    setLoading(false);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground">Leave a Review</h3>
      <div className="mt-3 flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => setRating(n)} className={`text-2xl transition-transform hover:scale-110 ${n <= rating ? "" : "opacity-30"}`}>{n <= rating ? "★" : "☆"}</button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional comment..." className="mt-3 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      <Button variant="default" size="sm" className="mt-3" onClick={handleSubmit} disabled={loading || rating === 0}>
        {loading ? "Submitting..." : "Submit Review"}
      </Button>
    </div>
  );
}

/* ─── Report Button ─── */
function ReportButton({ eventId, userId }: { eventId: string; userId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    if (!reason) return;
    setLoading(true);
    const { error } = await supabase.from("reports").insert({
      reporter_user_id: userId,
      target_type: "event" as const,
      target_id: eventId,
      reason,
      details: details || null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Report submitted. Thank you."); setShowForm(false); }
    setLoading(false);
  };

  return (
    <div className="mt-8 border-t border-border pt-6">
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          🚩 Report this event
        </button>
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="text-sm font-semibold text-foreground">Report Event</h4>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Select a reason...</option>
            <option value="spam">Spam or misleading</option>
            <option value="inappropriate">Inappropriate content</option>
            <option value="safety">Safety concern</option>
            <option value="other">Other</option>
          </select>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Additional details (optional)..." className="mt-2 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          <div className="mt-3 flex gap-2">
            <Button variant="destructive" size="sm" onClick={handleReport} disabled={loading || !reason}>
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
