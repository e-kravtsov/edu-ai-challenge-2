import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEventDate, formatEventTime } from "@/lib/mock-data";

export const Route = createFileRoute("/tickets")({
  component: TicketsPage,
  head: () => ({ meta: [{ title: "My Tickets — Happenin" }] }),
});

interface TicketWithEvent {
  id: string;
  ticket_code: string;
  qr_payload: string;
  issued_at: string;
  event_id: string;
  events: { title: string; starts_at: string; ends_at: string; venue_address: string | null; venue_type: string; slug: string } | null;
}

function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketWithEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase.from("tickets").select("*, events(title, starts_at, ends_at, venue_address, venue_type, slug)").eq("user_id", user.id).order("issued_at", { ascending: false })
      .then(({ data }) => { setTickets((data as unknown as TicketWithEvent[]) || []); setLoading(false); });
  }, [user]);

  if (!user) return <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Please sign in to view your tickets</p></main><Footer /></div>;

  const upcomingTickets = tickets.filter(t => t.events && new Date(t.events.ends_at) >= new Date());
  const pastTickets = tickets.filter(t => t.events && new Date(t.events.ends_at) < new Date());

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground">My Tickets</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your confirmed event tickets</p>

          {loading ? (
            <p className="mt-8 text-muted-foreground">Loading...</p>
          ) : tickets.length === 0 ? (
            <div className="mt-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-3xl">🎟️</div>
              <h3 className="text-lg font-semibold text-foreground">No tickets yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">RSVP to an event to get your ticket</p>
            </div>
          ) : (
            <>
              {upcomingTickets.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Upcoming</h2>
                  <div className="mt-3 space-y-4">
                    {upcomingTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}
                  </div>
                </div>
              )}
              {pastTickets.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Past</h2>
                  <div className="mt-3 space-y-4">
                    {pastTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} isPast />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function TicketCard({ ticket, isPast }: { ticket: TicketWithEvent; isPast?: boolean }) {
  const [showQr, setShowQr] = useState(false);
  const evt = ticket.events;
  if (!evt) return null;

  const generateIcs = () => {
    const start = new Date(evt.starts_at).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const end = new Date(evt.ends_at).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${start}\nDTEND:${end}\nSUMMARY:${evt.title}\nLOCATION:${evt.venue_address || "Online"}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${evt.title.replace(/\s+/g, "-")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`rounded-xl border border-border bg-card shadow-card overflow-hidden ${isPast ? "opacity-60" : ""}`}>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-card-foreground">{evt.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{formatEventDate(evt.starts_at)} · {formatEventTime(evt.starts_at)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{evt.venue_type === "online" ? "Online" : evt.venue_address}</p>
          </div>
          {isPast && <Badge variant="secondary">Past</Badge>}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="rounded-md border border-dashed border-border bg-muted/50 px-3 py-1.5">
            <p className="text-xs text-muted-foreground">Ticket Code</p>
            <p className="font-mono text-sm font-bold text-foreground tracking-wider">{ticket.ticket_code}</p>
          </div>
          <div className="flex gap-2">
            {!isPast && <Button variant="outline" size="sm" onClick={generateIcs}>📅 Calendar</Button>}
            <Button variant="outline" size="sm" onClick={() => setShowQr(!showQr)}>QR Code</Button>
          </div>
        </div>
        {showQr && (
          <div className="mt-4 flex justify-center">
            <QRDisplay payload={ticket.qr_payload} />
          </div>
        )}
      </div>
    </div>
  );
}

function QRDisplay({ payload }: { payload: string }) {
  const [qrUrl, setQrUrl] = useState<string>("");

  useEffect(() => {
    import("qrcode").then(QRCode => {
      QRCode.toDataURL(payload, { width: 200, margin: 2 }).then(setQrUrl);
    });
  }, [payload]);

  if (!qrUrl) return <p className="text-sm text-muted-foreground">Generating QR...</p>;
  return <img src={qrUrl} alt="Ticket QR Code" className="h-48 w-48 rounded-lg" />;
}
