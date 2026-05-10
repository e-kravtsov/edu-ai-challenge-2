import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/host/$hostSlug/members")({
  component: MembersPage,
});

interface Member {
  id: string;
  user_id: string;
  role: string;
  profiles: { full_name: string; email: string } | null;
}

interface Invite {
  id: string;
  role: string;
  token: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  accepted_by: string | null;
  acceptedProfile?: { full_name: string; email: string } | null;
}

function MembersPage() {
  const { hostSlug } = Route.useParams();
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteRole, setInviteRole] = useState<"host" | "checker">("checker");
  const [hostId, setHostId] = useState("");

  const load = async (hId: string) => {
    const [{ data: mems }, { data: invs }] = await Promise.all([
      supabase.from("host_members").select("*, profiles:user_id(full_name, email)").eq("host_id", hId),
      supabase.from("host_invites").select("*").eq("host_id", hId).order("created_at", { ascending: false }),
    ]);
    setMembers((mems as any) || []);
    const inviteList = (invs as Invite[]) || [];
    const acceptedIds = inviteList.map(i => i.accepted_by).filter(Boolean) as string[];
    if (acceptedIds.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, email").in("id", acceptedIds);
      const byId = new Map((profs || []).map(p => [p.id, p]));
      inviteList.forEach(i => { if (i.accepted_by) i.acceptedProfile = byId.get(i.accepted_by) as any; });
    }
    setInvites(inviteList);
  };

  useEffect(() => {
    (async () => {
      const { data: h } = await supabase.from("hosts").select("id").eq("slug", hostSlug).single();
      if (!h) return;
      setHostId(h.id);
      await load(h.id);
    })();
  }, [hostSlug]);

  const createInvite = async () => {
    if (!hostId || !user) return;
    const { data, error } = await supabase.from("host_invites").insert({ host_id: hostId, role: inviteRole, created_by: user.id }).select().single();
    if (error) { toast.error(error.message); return; }
    setInviteLink(`${window.location.origin}/invite/${data.token}`);
    toast.success("Invite link created!");
    load(hostId);
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied!");
  };

  const now = new Date();
  const pending = invites.filter(i => !i.accepted_at && new Date(i.expires_at) > now);
  const expired = invites.filter(i => !i.accepted_at && new Date(i.expires_at) <= now);
  const accepted = invites.filter(i => i.accepted_at);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-xl px-4">
          <h1 className="text-2xl font-bold text-foreground">Members</h1>

          <section className="mt-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Active Members ({members.length})</h2>
            <div className="mt-2 space-y-2">
              {members.length === 0 && <p className="text-sm text-muted-foreground">No members yet.</p>}
              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                  <div className="min-w-0">
                    <p className="font-medium text-card-foreground truncate">{m.profiles?.full_name || m.profiles?.email || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.profiles?.email}</p>
                  </div>
                  <Badge variant={m.role === "host" ? "default" : "secondary"}>{m.role}</Badge>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Pending Invites ({pending.length})</h2>
            <div className="mt-2 space-y-2">
              {pending.length === 0 && <p className="text-sm text-muted-foreground">No pending invites.</p>}
              {pending.map(i => (
                <div key={i.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                  <div className="min-w-0">
                    <p className="font-medium text-card-foreground">Invite link</p>
                    <p className="text-xs text-muted-foreground">Sent {new Date(i.created_at).toLocaleDateString()} · Expires {new Date(i.expires_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline">{i.role}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => copyLink(i.token)}>Copy</Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {accepted.length > 0 && (
            <section className="mt-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Accepted Invites ({accepted.length})</h2>
              <div className="mt-2 space-y-2">
                {accepted.map(i => (
                  <div key={i.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                    <div className="min-w-0">
                      <p className="font-medium text-card-foreground truncate">{i.acceptedProfile?.full_name || i.acceptedProfile?.email || "Accepted"}</p>
                      <p className="text-xs text-muted-foreground">Accepted {new Date(i.accepted_at!).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="secondary">{i.role}</Badge>
                  </div>
                ))}
              </div>
            </section>
          )}

          {expired.length > 0 && (
            <section className="mt-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Expired ({expired.length})</h2>
              <div className="mt-2 space-y-2">
                {expired.map(i => (
                  <div key={i.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3 opacity-60">
                    <p className="text-sm text-muted-foreground">Expired {new Date(i.expires_at).toLocaleDateString()}</p>
                    <Badge variant="outline">{i.role}</Badge>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="mt-6 rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold text-card-foreground">Invite Member</h3>
            <div className="mt-3 flex gap-2">
              <Button variant={inviteRole === "checker" ? "default" : "outline"} size="sm" onClick={() => setInviteRole("checker")}>Checker</Button>
              <Button variant={inviteRole === "host" ? "default" : "outline"} size="sm" onClick={() => setInviteRole("host")}>Host</Button>
              <Button variant="hero" size="sm" onClick={createInvite}>Generate Link</Button>
            </div>
            {inviteLink && (
              <div className="mt-3">
                <input readOnly value={inviteLink} className="w-full rounded-md border border-input bg-muted px-3 py-1.5 text-xs font-mono" onClick={(e) => { (e.target as HTMLInputElement).select(); navigator.clipboard.writeText(inviteLink); toast.success("Copied!"); }} />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
