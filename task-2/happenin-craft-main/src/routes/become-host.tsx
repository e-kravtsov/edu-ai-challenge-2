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

export const Route = createFileRoute("/become-host")({
  component: BecomeHostPage,
  head: () => ({
    meta: [
      { title: "Become a Host — Happenin" },
      { name: "description", content: "Start hosting free community events on Happenin" },
    ],
  }),
});

function BecomeHostPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Sign in to become a host</h1>
            <Button variant="hero" className="mt-4" onClick={() => navigate({ to: "/signin" })}>Sign In</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

    const { data: host, error: hostError } = await supabase.from("hosts").insert({
      name,
      slug: cleanSlug,
      bio,
      contact_email: contactEmail || user.email,
      created_by: user.id,
    }).select().single();

    if (hostError) {
      toast.error(hostError.message);
      setLoading(false);
      return;
    }

    const { error: memberError } = await supabase.from("host_members").insert({
      host_id: host.id,
      user_id: user.id,
      role: "host" as const,
    });

    if (memberError) {
      toast.error(memberError.message);
      setLoading(false);
      return;
    }

    toast.success("You're now a host!");
    navigate({ to: "/host/$hostSlug/dashboard", params: { hostSlug: cleanSlug } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-lg px-4">
          <h1 className="text-3xl font-bold text-foreground">Become a Host</h1>
          <p className="mt-2 text-muted-foreground">Set up your organizer profile to start hosting events.</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="name">Organization Name</Label>
              <Input id="name" value={name} onChange={(e) => { setName(e.target.value); if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-")); }} required />
            </div>
            <div>
              <Label htmlFor="slug">URL Slug</Label>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="my-org" />
              <p className="mt-1 text-xs text-muted-foreground">happenin.app/hosts/{slug || "my-org"}</p>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]" placeholder="Tell people about your organization..." />
            </div>
            <div>
              <Label htmlFor="email">Contact Email</Label>
              <Input id="email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder={user.email ?? ""} />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Host Profile"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
