import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatEventDate, formatEventTime } from "@/lib/mock-data";
import type { Database } from "@/integrations/supabase/types";

type Event = Database["public"]["Tables"]["events"]["Row"];

export const Route = createFileRoute("/explore")({
  component: ExplorePage,
  head: () => ({
    meta: [
      { title: "Explore Events — Happenin" },
      { name: "description", content: "Discover free community events near you." },
      { property: "og:title", content: "Explore Events — Happenin" },
    ],
  }),
});

function ExplorePage() {
  const [search, setSearch] = useState("");
  const [showPast, setShowPast] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("events").select("*").eq("state", "published").eq("visibility", "public").order("starts_at", { ascending: true })
      .then(({ data }) => { setEvents(data || []); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    let evts = events;
    if (!showPast) evts = evts.filter(e => new Date(e.ends_at) >= new Date());
    if (search.trim()) {
      const q = search.toLowerCase();
      evts = evts.filter(e => e.title.toLowerCase().includes(q) || (e.description || "").toLowerCase().includes(q) || (e.venue_address || "").toLowerCase().includes(q));
    }
    return evts;
  }, [events, search, showPast]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="border-b border-border bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Explore Events</h1>
            <p className="mt-2 text-muted-foreground">Find your next community experience</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Button variant={showPast ? "default" : "outline"} size="sm" onClick={() => setShowPast(!showPast)}>Include Past</Button>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {!loading && <Badge variant="secondary" className="mb-4 text-xs font-normal">{filtered.length} event{filtered.length !== 1 ? "s" : ""}</Badge>}
          {loading ? (
            <p className="py-20 text-center text-muted-foreground">Loading events...</p>
          ) : filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(event => (
                <RealEventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-warm/20 text-4xl">🎈</div>
              <h3 className="text-xl font-semibold text-foreground">No events yet — be the first!</h3>
              <p className="mt-2 max-w-sm mx-auto text-sm text-muted-foreground">
                {search.trim() ? "No events match your search. Try different keywords or clear your filter." : "There are no upcoming events right now. Why not kick things off and host one?"}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {search.trim() && (
                  <Button variant="outline" size="sm" onClick={() => setSearch("")}>Clear Search</Button>
                )}
                <Link to="/become-host">
                  <Button variant="hero" size="sm">Host an Event</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function RealEventCard({ event }: { event: Event }) {
  const isPast = new Date(event.ends_at) < new Date();
  return (
    <Link to="/events/$slug" params={{ slug: event.slug }} className="group block overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5">
      <div className="relative aspect-[2/1] overflow-hidden bg-muted">
        {event.cover_image_url ? (
          <img src={event.cover_image_url} alt={event.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-warm text-3xl">🎉</div>
        )}
        {isPast && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/50">
            <Badge variant="secondary" className="bg-background/90 text-foreground font-semibold text-xs">Ended</Badge>
          </div>
        )}
        <Badge className="absolute left-3 top-3 bg-success text-success-foreground text-xs">Free</Badge>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-primary font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /></svg>
          {formatEventDate(event.starts_at)} · {formatEventTime(event.starts_at)}
        </div>
        <h3 className="mt-1.5 text-base font-semibold text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">{event.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{event.venue_type === "online" ? "Online" : event.venue_address}</span>
          <span>{event.capacity} capacity</span>
        </div>
      </div>
    </Link>
  );
}
