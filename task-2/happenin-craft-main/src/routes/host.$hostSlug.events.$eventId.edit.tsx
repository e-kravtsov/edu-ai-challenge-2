import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Event = Database["public"]["Tables"]["events"]["Row"];

export const Route = createFileRoute("/host/$hostSlug/events/$eventId/edit")({
  component: EditEventPage,
});

function EditEventPage() {
  const { hostSlug, eventId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [venueType, setVenueType] = useState<"physical" | "online">("physical");
  const [venueAddress, setVenueAddress] = useState("");
  const [onlineUrl, setOnlineUrl] = useState("");
  const [capacity, setCapacity] = useState("100");
  const [visibility, setVisibility] = useState<"public" | "unlisted">("public");
  const [coverUrl, setCoverUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("events").select("*").eq("id", eventId).single().then(({ data }) => {
      if (!data) return;
      setEvent(data);
      setTitle(data.title);
      setDescription(data.description || "");
      setStartsAt(data.starts_at.slice(0, 16));
      setEndsAt(data.ends_at.slice(0, 16));
      setVenueType(data.venue_type as "physical" | "online");
      setVenueAddress(data.venue_address || "");
      setOnlineUrl(data.online_url || "");
      setCapacity(String(data.capacity));
      setVisibility(data.visibility as "public" | "unlisted");
      setCoverUrl(data.cover_image_url || "");
    });
  }, [eventId]);

  if (!user || !event) return <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></main></div>;

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("events").update({
      title, description,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      venue_type: venueType,
      venue_address: venueType === "physical" ? venueAddress : null,
      online_url: venueType === "online" ? onlineUrl : null,
      capacity: parseInt(capacity) || 100,
      visibility,
      cover_image_url: coverUrl || null,
    }).eq("id", eventId);
    if (error) toast.error(error.message);
    else toast.success("Event updated!");
    setLoading(false);
  };

  const handlePublish = async () => {
    const newState = event.state === "published" ? "draft" : "published";
    const { error } = await supabase.from("events").update({ state: newState }).eq("id", eventId);
    if (error) { toast.error(error.message); return; }
    setEvent({ ...event, state: newState });
    toast.success(newState === "published" ? "Event published!" : "Event unpublished");
  };

  const handleDuplicate = async () => {
    const { data: host } = await supabase.from("hosts").select("id").eq("slug", hostSlug).single();
    if (!host) return;
    const newSlug = event.slug + "-copy-" + Date.now().toString(36);
    const { error } = await supabase.from("events").insert({
      host_id: host.id,
      slug: newSlug,
      title: event.title + " (Copy)",
      description: event.description,
      starts_at: event.starts_at,
      ends_at: event.ends_at,
      venue_type: event.venue_type,
      venue_address: event.venue_address,
      online_url: event.online_url,
      capacity: event.capacity,
      visibility: event.visibility,
      cover_image_url: event.cover_image_url,
      state: "draft",
      created_by: user.id,
      duplicated_from_event_id: event.id,
    });
    if (error) toast.error(error.message);
    else { toast.success("Event duplicated!"); navigate({ to: "/host/$hostSlug/dashboard", params: { hostSlug } }); }
  };

  const handleExportCsv = async () => {
    const { data: rsvps, error: rsvpErr } = await supabase.from("rsvps").select("*").eq("event_id", eventId);
    if (rsvpErr || !rsvps || rsvps.length === 0) {
      toast.error(rsvpErr?.message || "No RSVPs to export");
      return;
    }

    // Fetch profiles for all RSVP user ids
    const userIds = [...new Set(rsvps.map(r => r.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", userIds);
    const profileMap = new Map<string, { full_name: string | null; email: string | null }>();
    profiles?.forEach(p => profileMap.set(p.id, p));

    // Fetch check-ins
    const { data: checkIns } = await supabase.from("check_ins").select("*, tickets(user_id)").eq("event_id", eventId).eq("is_active", true);
    const checkInMap = new Map<string, string>();
    checkIns?.forEach(ci => {
      const uid = (ci.tickets as unknown as { user_id: string } | null)?.user_id;
      if (uid) checkInMap.set(uid, ci.checked_in_at);
    });

    const rows = [["Name", "Email", "RSVP Status", "Check-in Time"]];
    rsvps.forEach(r => {
      const p = profileMap.get(r.user_id);
      rows.push([p?.full_name || "", p?.email || "", r.status, checkInMap.get(r.user_id) || ""]);
    });

    const csv = rows.map(r => r.map(c => `"${(c || "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, "-")}-rsvps.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-lg px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">Edit Event</h1>
            <div className="flex gap-2">
              <Button variant={event.state === "published" ? "destructive" : "hero"} size="sm" onClick={handlePublish}>
                {event.state === "published" ? "Unpublish" : "Publish"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDuplicate}>Duplicate</Button>
              <Button variant="outline" size="sm" onClick={handleExportCsv}>Export CSV</Button>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
            <div><Label>Description</Label><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start</Label><Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required /></div>
              <div><Label>End</Label><Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required /></div>
            </div>
            <div>
              <Label>Venue</Label>
              <div className="flex gap-2 mt-1">
                <Button type="button" variant={venueType === "physical" ? "default" : "outline"} size="sm" onClick={() => setVenueType("physical")}>In Person</Button>
                <Button type="button" variant={venueType === "online" ? "default" : "outline"} size="sm" onClick={() => setVenueType("online")}>Online</Button>
              </div>
            </div>
            {venueType === "physical" ? (
              <div><Label>Address</Label><Input value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} /></div>
            ) : (
              <div><Label>Link</Label><Input value={onlineUrl} onChange={(e) => setOnlineUrl(e.target.value)} /></div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Capacity</Label><Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} min="1" /></div>
              <div><Label>Visibility</Label>
                <div className="flex gap-2 mt-1">
                  <Button type="button" variant={visibility === "public" ? "default" : "outline"} size="sm" onClick={() => setVisibility("public")}>Public</Button>
                  <Button type="button" variant={visibility === "unlisted" ? "default" : "outline"} size="sm" onClick={() => setVisibility("unlisted")}>Unlisted</Button>
                </div>
              </div>
            </div>
            <div><Label>Cover Image URL</Label><Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} /></div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
