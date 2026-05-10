import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/host/$hostSlug/events/$eventId/check-in")({
  component: CheckInPage,
});

function CheckInPage() {
  const { hostSlug, eventId } = Route.useParams();
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [checkedIn, setCheckedIn] = useState(0);
  const [total, setTotal] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState<{ id: string; code: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCounts();
  }, [eventId]);

  const loadCounts = async () => {
    const { count: ci } = await supabase.from("check_ins").select("*", { count: "exact", head: true }).eq("event_id", eventId).eq("is_active", true);
    const { count: going } = await supabase.from("rsvps").select("*", { count: "exact", head: true }).eq("event_id", eventId).eq("status", "confirmed");
    setCheckedIn(ci || 0);
    setTotal(going || 0);
  };

  const handleCheckIn = async () => {
    if (!code.trim() || !user) return;
    setLoading(true);
    const { data: ticket } = await supabase.from("tickets").select("*").eq("event_id", eventId).eq("ticket_code", code.toUpperCase().trim()).maybeSingle();
    if (!ticket) { toast.error("Ticket not found"); setLoading(false); return; }

    const { data: existing } = await supabase.from("check_ins").select("id").eq("ticket_id", ticket.id).eq("is_active", true).maybeSingle();
    if (existing) { toast.error("Already checked in"); setLoading(false); return; }

    const { data: ci, error } = await supabase.from("check_ins").insert({
      event_id: eventId, ticket_id: ticket.id, checked_in_by: user.id,
    }).select().single();

    if (error) { toast.error(error.message); setLoading(false); return; }
    setLastCheckIn({ id: ci.id, code: ticket.ticket_code });
    setCode("");
    toast.success("Checked in!");
    loadCounts();
    setLoading(false);
  };

  const handleUndo = async () => {
    if (!lastCheckIn || !user) return;
    await supabase.from("check_ins").update({ is_active: false, undone_by: user.id, undone_at: new Date().toISOString() }).eq("id", lastCheckIn.id);
    toast.info(`Undid check-in for ${lastCheckIn.code}`);
    setLastCheckIn(null);
    loadCounts();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-md px-4">
          <h1 className="text-2xl font-bold text-foreground text-center">Check-In</h1>
          <div className="mt-6 flex justify-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">{checkedIn}</div>
              <div className="text-sm text-muted-foreground">Checked In</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-muted-foreground">{total}</div>
              <div className="text-sm text-muted-foreground">Total Going</div>
            </div>
          </div>
          <div className="mt-8 flex gap-2">
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter ticket code..." className="font-mono uppercase" onKeyDown={(e) => e.key === "Enter" && handleCheckIn()} />
            <Button variant="hero" onClick={handleCheckIn} disabled={loading}>Check In</Button>
          </div>
          {lastCheckIn && (
            <Button variant="outline" className="mt-3 w-full" onClick={handleUndo}>Undo last ({lastCheckIn.code})</Button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
