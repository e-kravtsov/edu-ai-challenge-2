import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatEventDate } from "@/lib/mock-data";
import type { Database } from "@/integrations/supabase/types";

type Event = Database["public"]["Tables"]["events"]["Row"];

interface MyEvent {
  event: Event;
  role: "host" | "checker" | "attendee";
  hostSlug: string;
  hostName: string;
}

export const Route = createFileRoute("/my-events")({
  component: MyEventsPage,
  head: () => ({ meta: [{ title: "My Events — Happenin" }] }),
});

function MyEventsPage() {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState<MyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [hostFilter, setHostFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      // 1. Get all host memberships with host info
      const { data: memberships } = await supabase
        .from("host_members")
        .select("host_id, role, hosts(id, slug, name)")
        .eq("user_id", user.id);

      const hostMap = new Map<string, { slug: string; name: string; role: string }>();
      for (const m of memberships || []) {
        const h = m.hosts as unknown as { id: string; slug: string; name: string } | null;
        if (h) hostMap.set(h.id, { slug: h.slug, name: h.name, role: m.role });
      }

      // 2. Get events for all hosts user is a member of
      const hostIds = [...hostMap.keys()];
      let hostEvents: Event[] = [];
      if (hostIds.length > 0) {
        const { data } = await supabase.from("events").select("*").in("host_id", hostIds);
        hostEvents = data || [];
      }

      // 3. Get events user RSVPed to
      const { data: rsvps } = await supabase
        .from("rsvps")
        .select("event_id, status")
        .eq("user_id", user.id)
        .in("status", ["confirmed", "waitlisted"]);

      const rsvpEventIds = (rsvps || []).map(r => r.event_id);
      // Filter out events already covered by host membership
      const hostEventIds = new Set(hostEvents.map(e => e.id));
      const extraRsvpIds = rsvpEventIds.filter(id => !hostEventIds.has(id));

      let rsvpEvents: Event[] = [];
      if (extraRsvpIds.length > 0) {
        const { data } = await supabase.from("events").select("*").in("id", extraRsvpIds);
        rsvpEvents = data || [];
      }

      // For RSVP events, fetch their host info
      const rsvpHostIds = [...new Set(rsvpEvents.map(e => e.host_id))];
      let rsvpHosts: Array<{ id: string; slug: string; name: string }> = [];
      if (rsvpHostIds.length > 0) {
        const { data } = await supabase.from("hosts").select("id, slug, name").in("id", rsvpHostIds);
        rsvpHosts = data || [];
      }
      const rsvpHostMap = new Map(rsvpHosts.map(h => [h.id, h]));

      // 4. Combine all events
      const all: MyEvent[] = [];
      for (const e of hostEvents) {
        const info = hostMap.get(e.host_id)!;
        all.push({
          event: e,
          role: info.role as "host" | "checker",
          hostSlug: info.slug,
          hostName: info.name,
        });
      }
      for (const e of rsvpEvents) {
        const h = rsvpHostMap.get(e.host_id);
        all.push({
          event: e,
          role: "attendee",
          hostSlug: h?.slug || "",
          hostName: h?.name || "Unknown",
        });
      }

      // Sort by starts_at descending
      all.sort((a, b) => new Date(b.event.starts_at).getTime() - new Date(a.event.starts_at).getTime());
      setMyEvents(all);
      setLoading(false);
    })();
  }, [user]);

  const hosts = useMemo(() => {
    const map = new Map<string, string>();
    for (const me of myEvents) map.set(me.hostSlug, me.hostName);
    return [...map.entries()];
  }, [myEvents]);

  const filtered = useMemo(() => {
    const now = new Date();
    return myEvents.filter(me => {
      if (hostFilter !== "all" && me.hostSlug !== hostFilter) return false;
      if (dateFilter === "upcoming" && new Date(me.event.ends_at) < now) return false;
      if (dateFilter === "past" && new Date(me.event.ends_at) >= now) return false;
      if (search && !me.event.title.toLowerCase().includes(search.toLowerCase()) && !me.hostName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [myEvents, hostFilter, dateFilter, search]);

  if (!user) return <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Please sign in</p></main><Footer /></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-2xl font-bold text-foreground">My Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">Events you host, check-in for, or attend</p>

          {loading ? (
            <p className="mt-8 text-muted-foreground">Loading...</p>
          ) : myEvents.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-muted-foreground">You don't have any events yet.</p>
              <div className="mt-4 flex justify-center gap-3">
                <Link to="/explore"><Button variant="outline">Explore Events</Button></Link>
                <Link to="/become-host"><Button variant="hero">Become a Host</Button></Link>
              </div>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Search events..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="sm:max-w-[220px]"
                />
                <select
                  value={hostFilter}
                  onChange={e => setHostFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
                >
                  <option value="all">All Hosts</option>
                  {hosts.map(([slug, name]) => (
                    <option key={slug} value={slug}>{name}</option>
                  ))}
                </select>
                <div className="flex gap-1">
                  {(["all", "upcoming", "past"] as const).map(v => (
                    <Button
                      key={v}
                      size="sm"
                      variant={dateFilter === v ? "default" : "outline"}
                      onClick={() => setDateFilter(v)}
                      className="capitalize"
                    >
                      {v}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div className="mt-4 space-y-3">
                {filtered.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No events match your filters.</p>
                ) : filtered.map(me => (
                  <MyEventRow key={`${me.event.id}-${me.role}`} item={me} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

const roleBadge: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  host: { label: "Host", variant: "default" },
  checker: { label: "Checker", variant: "secondary" },
  attendee: { label: "Attending", variant: "outline" },
};

function MyEventRow({ item }: { item: MyEvent }) {
  const { event, role, hostSlug, hostName } = item;
  const isPast = new Date(event.ends_at) < new Date();
  const rb = roleBadge[role];

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium text-card-foreground truncate">{event.title}</h3>
          <Badge variant={rb.variant} className="text-xs shrink-0">{rb.label}</Badge>
          {isPast && <Badge variant="outline" className="text-xs shrink-0">Ended</Badge>}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {hostName} · {formatEventDate(event.starts_at)}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-4">
        {role === "attendee" ? (
          <Link to="/events/$slug" params={{ slug: event.slug }}>
            <Button variant="outline" size="sm">View</Button>
          </Link>
        ) : (
          <>
            {role === "host" && (
              <Link to="/host/$hostSlug/events/$eventId/edit" params={{ hostSlug, eventId: event.id }}>
                <Button variant="ghost" size="sm">Edit</Button>
              </Link>
            )}
            <Link to="/host/$hostSlug/events/$eventId/check-in" params={{ hostSlug, eventId: event.id }}>
              <Button variant="outline" size="sm">Check-In</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
