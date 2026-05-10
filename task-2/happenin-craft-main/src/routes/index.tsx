import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { EventCard, type EventCardData } from "@/components/EventCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import heroImage from "@/assets/hero-event.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Happenin — Discover & Host Free Community Events" },
      { name: "description", content: "Find and host free community events. RSVP, get digital tickets, and connect with your local community." },
      { property: "og:title", content: "Happenin — Discover & Host Free Community Events" },
      { property: "og:description", content: "Find and host free community events. RSVP, get digital tickets, and connect with your local community." },
    ],
  }),
});

function Index() {
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ events: 0, hosts: 0 });

  useEffect(() => {
    (async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("state", "published")
        .gte("ends_at", now)
        .order("starts_at", { ascending: true })
        .limit(6);

      const mapped: EventCardData[] = (data || []).map((e) => ({
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

      const { count: eventCount } = await supabase.from("events").select("*", { count: "exact", head: true }).eq("state", "published");
      const { count: hostCount } = await supabase.from("hosts").select("*", { count: "exact", head: true });
      setStats({ events: eventCount || 0, hosts: hostCount || 0 });
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="h-full w-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 sm:py-36 lg:px-8 lg:py-44">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary-foreground/90 backdrop-blur-sm">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Always free for community events
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
              Where communities{" "}
              <span className="text-gradient-primary">come together</span>
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-md">
              Discover local events, RSVP instantly, and get your digital ticket — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/explore">
                <Button variant="hero" size="lg" className="text-base px-8">
                  Explore Events
                </Button>
              </Link>
              <Link to="/become-host">
                <Button variant="outline" size="lg" className="text-base px-8 border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground">
                  Host an Event
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground sm:text-3xl">{stats.events || "—"}</div>
              <div className="mt-1 text-sm text-muted-foreground">Events Published</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground sm:text-3xl">{stats.hosts || "—"}</div>
              <div className="mt-1 text-sm text-muted-foreground">Host Organizations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground sm:text-3xl">100%</div>
              <div className="mt-1 text-sm text-muted-foreground">Free</div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Upcoming Events</h2>
              <p className="mt-2 text-muted-foreground">Don't miss what's happening near you</p>
            </div>
            <Link to="/explore" className="hidden text-sm font-medium text-primary hover:text-primary/80 transition-colors sm:block">
              View all →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card shadow-card animate-pulse">
                  <div className="aspect-[2/1] bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 w-24 rounded bg-muted" />
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted" />
                  </div>
                </div>
              ))
            ) : events.length === 0 ? (
              <div className="col-span-full py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warm/20 text-3xl">🎈</div>
                <h3 className="text-lg font-semibold text-foreground">No upcoming events yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Be the first to host an event on Happenin!</p>
                <Link to="/become-host">
                  <Button variant="hero" className="mt-4">Host an Event</Button>
                </Link>
              </div>
            ) : (
              events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            )}
          </div>
          {!loading && events.length > 0 && (
            <div className="mt-8 text-center sm:hidden">
              <Link to="/explore">
                <Button variant="outline">View all events</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-warm py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">How It Works</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">Getting started is simple — whether you're attending or hosting</p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              { icon: "🔍", title: "Discover", desc: "Browse events by location, date, or interest. Find what excites you." },
              { icon: "🎟️", title: "RSVP & Get Your Ticket", desc: "One click to reserve your spot. Get a digital ticket with QR code." },
              { icon: "🎉", title: "Show Up & Enjoy", desc: "Check in at the venue with your ticket. Connect with your community." },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-background text-2xl shadow-card">
                  {step.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl bg-gradient-hero p-8 text-center sm:p-12">
            <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
              Ready to host your own event?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-primary-foreground/80">
              Create your free event in minutes. Manage RSVPs, check-ins, and more — all in one place.
            </p>
            <Link to="/become-host">
              <Button variant="outline" size="lg" className="mt-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground text-base px-8">
                Start Hosting — It's Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
