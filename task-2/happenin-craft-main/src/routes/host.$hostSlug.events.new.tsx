import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useEffect } from "react";

export const Route = createFileRoute("/host/$hostSlug/events/new")({
  component: NewEventPage,
});

function NewEventPage() {
  const { hostSlug } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hostId, setHostId] = useState<string | null>(null);
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
    supabase.from("hosts").select("id").eq("slug", hostSlug).single().then(({ data }) => {
      if (data) setHostId(data.id);
    });
  }, [hostSlug]);

  if (!user) return <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 flex items-center justify-center"><p>Please sign in</p></main></div>;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!hostId) return;
    setLoading(true);

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").slice(0, 60);

    const { error } = await supabase.from("events").insert({
      host_id: hostId,
      slug,
      title,
      description,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      venue_type: venueType,
      venue_address: venueType === "physical" ? venueAddress : null,
      online_url: venueType === "online" ? onlineUrl : null,
      capacity: parseInt(capacity) || 100,
      visibility,
      cover_image_url: coverUrl || null,
      state: "draft",
      created_by: user.id,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Event created as draft!");
    navigate({ to: "/host/$hostSlug/dashboard", params: { hostSlug } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-lg px-4">
          <h1 className="text-2xl font-bold text-foreground">Create Event</h1>
          <p className="mt-1 text-sm text-muted-foreground">Events start as drafts. Publish when ready.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label>Description</Label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date & Time</Label>
                <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
              </div>
              <div>
                <Label>End Date & Time</Label>
                <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required />
              </div>
            </div>
            <div>
              <Label>Venue Type</Label>
              <div className="flex gap-2 mt-1">
                <Button type="button" variant={venueType === "physical" ? "default" : "outline"} size="sm" onClick={() => setVenueType("physical")}>In Person</Button>
                <Button type="button" variant={venueType === "online" ? "default" : "outline"} size="sm" onClick={() => setVenueType("online")}>Online</Button>
              </div>
            </div>
            {venueType === "physical" ? (
              <div>
                <Label>Venue Address</Label>
                <Input value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} placeholder="123 Main St, City" />
              </div>
            ) : (
              <div>
                <Label>Online Link</Label>
                <Input value={onlineUrl} onChange={(e) => setOnlineUrl(e.target.value)} placeholder="https://meet.example.com/..." />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Capacity</Label>
                <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} min="1" />
              </div>
              <div>
                <Label>Visibility</Label>
                <div className="flex gap-2 mt-1">
                  <Button type="button" variant={visibility === "public" ? "default" : "outline"} size="sm" onClick={() => setVisibility("public")}>Public</Button>
                  <Button type="button" variant={visibility === "unlisted" ? "default" : "outline"} size="sm" onClick={() => setVisibility("unlisted")}>Unlisted</Button>
                </div>
              </div>
            </div>
            <div>
              <Label>Cover Image URL</Label>
              <Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label>Pricing</Label>
              <div className="flex gap-2 mt-1">
                <Button type="button" variant="default" size="sm" disabled>Free</Button>
                <Button type="button" variant="outline" size="sm" disabled title="Coming soon">Paid (Coming soon)</Button>
              </div>
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
