import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EventCard, type EventCardData } from "@/components/EventCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";

type Host = Database["public"]["Tables"]["hosts"]["Row"];

export const Route = createFileRoute("/hosts/$hostSlug")({
  component: HostProfilePage,
  head: () => ({
    meta: [{ title: "Host — Happenin" }],
  }),
});

function HostProfilePage() {
  const { hostSlug } = Route.useParams();
  const [host, setHost] = useState<Host | null>(null);
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: h } = await supabase
        .from("hosts")
        .select("*")
        .eq("slug", hostSlug)
        .single();

      if (!h) {
        setLoading(false);
        return;
      }
      setHost(h);

      const { data: evts } = await supabase
        .from("events")
        .select("*")
        .eq("host_id", h.id)
        .eq("state", "published")
        .order("starts_at", { ascending: false });

      const mapped: EventCardData[] = (evts || []).map((e) => ({
        id: e.id,
        slug: e.slug,
        title: e.title,
        description: e.description,
        startsAt: e.starts_at,
        endsAt: e.ends_at,
        coverImageUrl: e.cover_image_url,
        venueType: e.venue_type,
        venueAddress: e.venue_address,
        capacity: e.capacity,
        pricingMode: e.pricing_mode,
      }));
      setEvents(mapped);
      setLoading(false);
    })();
  }, [hostSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  if (!host) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Host not found</h1>
            <Link to="/explore">
              <Button variant="default" className="mt-6">Browse Events</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.endsAt) >= now);
  const past = events.filter((e) => new Date(e.endsAt) < now);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Host Header */}
        <div className="border-b border-border bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-hero text-3xl font-bold text-primary-foreground shadow-card">
                {host.logo_url ? (
                  <img src={host.logo_url} alt={host.name} className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  host.name.charAt(0)
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{host.name}</h1>
                {host.bio && (
                  <p className="mt-1 text-muted-foreground max-w-lg">{host.bio}</p>
                )}
                <div className="mt-2 flex items-center gap-3">
                  <Badge variant="secondary">{events.length} event{events.length !== 1 ? "s" : ""}</Badge>
                  {host.contact_email && (
                    <a href={`mailto:${host.contact_email}`} className="text-xs text-primary hover:underline">
                      Contact
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events */}
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-foreground">Past Events</h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {events.length === 0 && (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-3xl">📅</div>
              <h3 className="text-lg font-semibold text-foreground">No published events yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">This host hasn't published any events.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
