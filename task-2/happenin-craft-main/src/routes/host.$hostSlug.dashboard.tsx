import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatEventDate } from "@/lib/mock-data";
import type { Database } from "@/integrations/supabase/types";

type Host = Database["public"]["Tables"]["hosts"]["Row"];
type Event = Database["public"]["Tables"]["events"]["Row"];

interface EventStats {
  going: number;
  waitlisted: number;
  checkedIn: number;
}

export const Route = createFileRoute("/host/$hostSlug/dashboard")({
  component: HostDashboardPage,
});

function HostDashboardPage() {
  const { hostSlug } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [host, setHost] = useState<Host | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<Record<string, EventStats>>({});
  const [loading, setLoading] = useState(true);
  const [memberRole, setMemberRole] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: h } = await supabase.from("hosts").select("*").eq("slug", hostSlug).single();
      if (!h) { setLoading(false); return; }
      setHost(h);

      const [{ data: membership }, { data: evts }] = await Promise.all([
        supabase.from("host_members").select("role").eq("host_id", h.id).eq("user_id", user.id).maybeSingle(),
        supabase.from("events").select("*").eq("host_id", h.id).order("starts_at", { ascending: false }),
      ]);

      setMemberRole(membership?.role ?? null);
      const eventList = evts || [];
      setEvents(eventList);

      if (eventList.length > 0) {
        const eventIds = eventList.map(e => e.id);
        const [{ data: rsvps }, { data: checkIns }] = await Promise.all([
          supabase.from("rsvps").select("event_id, status").in("event_id", eventIds).in("status", ["confirmed", "waitlisted"]),
          supabase.from("check_ins").select("event_id").in("event_id", eventIds).eq("is_active", true),
        ]);

        const s: Record<string, EventStats> = {};
        for (const e of eventList) {
          s[e.id] = { going: 0, waitlisted: 0, checkedIn: 0 };
        }
        for (const r of rsvps || []) {
          if (r.status === "confirmed") s[r.event_id].going++;
          else if (r.status === "waitlisted") s[r.event_id].waitlisted++;
        }
        for (const c of checkIns || []) {
          s[c.event_id].checkedIn++;
        }
        setStats(s);
      }

      setLoading(false);
    })();
  }, [user, hostSlug]);

  if (!user) return <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Please sign in</p></main></div>;
  if (loading) return <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></main></div>;
  if (!host) return <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Host not found</p></main></div>;

  const isHost = memberRole === "host";
  const now = new Date();
  const upcoming = events.filter(e => new Date(e.ends_at) >= now);
  const past = events.filter(e => new Date(e.ends_at) < now);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{host.name}</h1>
              <p className="text-sm text-muted-foreground">{isHost ? "Host Dashboard" : "Checker Dashboard"}</p>
            </div>
            {isHost && (
              <div className="flex gap-2">
                <Link to="/host/$hostSlug/gallery-review" params={{ hostSlug }}>
                  <Button variant="outline" size="sm">📷 Gallery</Button>
                </Link>
                <Link to="/host/$hostSlug/members" params={{ hostSlug }}>
                  <Button variant="outline" size="sm">Members</Button>
                </Link>
                <Link to="/host/$hostSlug/events/new" params={{ hostSlug }}>
                  <Button variant="hero" size="sm">New Event</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Events ({upcoming.length})</h2>
            {upcoming.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">{isHost ? "No upcoming events. Create one!" : "No upcoming events."}</p>
            ) : (
              <div className="mt-4 space-y-3">
                {upcoming.map(event => (
                  <EventRow key={event.id} event={event} hostSlug={hostSlug} isHost={isHost} stats={stats[event.id]} />
                ))}
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-foreground">Past Events ({past.length})</h2>
              <div className="mt-4 space-y-3">
                {past.map(event => (
                  <EventRow key={event.id} event={event} hostSlug={hostSlug} isHost={isHost} stats={stats[event.id]} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function EventRow({ event, hostSlug, isHost, stats }: { event: Event; hostSlug: string; isHost: boolean; stats?: EventStats }) {
  const isPast = new Date(event.ends_at) < new Date();
  const s = stats || { going: 0, waitlisted: 0, checkedIn: 0 };

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-card-foreground truncate">{event.title}</h3>
          <Badge variant={event.state === "published" ? "default" : "secondary"} className="text-xs shrink-0">
            {event.state}
          </Badge>
          {isPast && <Badge variant="outline" className="text-xs shrink-0">Ended</Badge>}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{formatEventDate(event.starts_at)} · {event.capacity} capacity</p>
        <div className="mt-1.5 flex gap-3 text-xs">
          <span className="text-success-foreground font-medium">{s.going} Going</span>
          {s.waitlisted > 0 && <span className="text-warning-foreground font-medium">{s.waitlisted} Waitlist</span>}
          <span className="text-muted-foreground">{s.checkedIn} Checked-in</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-4">
        {isHost && (
          <Link to="/host/$hostSlug/events/$eventId/edit" params={{ hostSlug, eventId: event.id }}>
            <Button variant="ghost" size="sm">Edit</Button>
          </Link>
        )}
        <Link to="/host/$hostSlug/events/$eventId/check-in" params={{ hostSlug, eventId: event.id }}>
          <Button variant="outline" size="sm">Check-In</Button>
        </Link>
      </div>
    </div>
  );
}
