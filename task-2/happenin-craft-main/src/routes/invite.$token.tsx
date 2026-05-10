import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/invite/$token")({
  component: InvitePage,
});

function InvitePage() {
  const { token } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<{ id: string; host_id: string; role: string; hosts: { name: string; slug: string } | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("host_invites").select("*, hosts(name, slug)").eq("token", token).is("accepted_by", null).maybeSingle()
      .then(({ data }) => { setInvite(data as any); setLoading(false); });
  }, [token]);

  const accept = async () => {
    if (!user || !invite) return;
    setLoading(true);
    await supabase.from("host_invites").update({ accepted_by: user.id, accepted_at: new Date().toISOString() }).eq("id", invite.id);
    await supabase.from("host_members").insert({ host_id: invite.host_id, user_id: user.id, role: invite.role as "host" | "checker" });
    toast.success(`Joined as ${invite.role}!`);
    navigate({ to: "/host/$hostSlug/dashboard", params: { hostSlug: invite.hosts?.slug || "" } });
  };

  if (!user) return <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 flex items-center justify-center"><p>Please sign in to accept this invite</p></main></div>;
  if (loading) return <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 flex items-center justify-center"><p>Loading...</p></main></div>;
  if (!invite) return <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 flex items-center justify-center"><p>Invite not found or already used</p></main></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-bold text-foreground">You're Invited!</h1>
          <p className="mt-2 text-muted-foreground">Join <strong>{invite.hosts?.name}</strong> as a <strong>{invite.role}</strong></p>
          <Button variant="hero" className="mt-6" onClick={accept} disabled={loading}>Accept Invite</Button>
        </div>
      </main>
    </div>
  );
}
