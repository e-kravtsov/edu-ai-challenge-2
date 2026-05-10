import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type GalleryUpload = Database["public"]["Tables"]["gallery_uploads"]["Row"];

interface UploadWithMeta extends GalleryUpload {
  eventTitle: string;
  uploaderName: string;
}

export const Route = createFileRoute("/host/$hostSlug/gallery-review")({
  component: GalleryReviewPage,
  head: () => ({
    meta: [{ title: "Gallery Review — Happenin" }],
  }),
});

function GalleryReviewPage() {
  const { hostSlug } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const [uploads, setUploads] = useState<UploadWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [hostId, setHostId] = useState<string | null>(null);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    (async () => {
      const { data: host } = await supabase
        .from("hosts")
        .select("id")
        .eq("slug", hostSlug)
        .single();
      if (!host) {
        setLoading(false);
        return;
      }
      setHostId(host.id);
      await fetchUploads(host.id);
    })();
  }, [hostSlug, user, authLoading]);

  const fetchUploads = async (hId: string) => {
    setLoading(true);
    // Get all events for this host
    const { data: events } = await supabase
      .from("events")
      .select("id, title")
      .eq("host_id", hId);

    if (!events || events.length === 0) {
      setUploads([]);
      setLoading(false);
      return;
    }

    const eventIds = events.map((e) => e.id);
    const eventMap = Object.fromEntries(events.map((e) => [e.id, e.title]));

    const { data: gallery } = await supabase
      .from("gallery_uploads")
      .select("*")
      .in("event_id", eventIds)
      .order("created_at", { ascending: false });

    if (!gallery) {
      setUploads([]);
      setLoading(false);
      return;
    }

    // Get uploader profiles
    const userIds = [...new Set(gallery.map((g) => g.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    const profileMap = Object.fromEntries(
      (profiles || []).map((p) => [p.id, p.full_name || p.email || "Unknown"])
    );

    setUploads(
      gallery.map((g) => ({
        ...g,
        eventTitle: eventMap[g.event_id] || "Unknown Event",
        uploaderName: profileMap[g.user_id] || "Unknown",
      }))
    );
    setLoading(false);
  };

  const updateStatus = async (
    uploadId: string,
    newStatus: "approved" | "rejected" | "hidden"
  ) => {
    setActionLoading(uploadId);
    const { error } = await supabase
      .from("gallery_uploads")
      .update({
        status: newStatus,
        reviewed_by: user!.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", uploadId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(
        newStatus === "approved"
          ? "Image approved!"
          : newStatus === "rejected"
            ? "Image rejected."
            : "Image hidden."
      );
      setUploads((prev) =>
        prev.map((u) => (u.id === uploadId ? { ...u, status: newStatus } : u))
      );
    }
    setActionLoading(null);
  };

  const filtered = uploads.filter((u) => u.status === tab);
  const pendingCount = uploads.filter((u) => u.status === "pending").length;
  const approvedCount = uploads.filter((u) => u.status === "approved").length;
  const rejectedCount = uploads.filter((u) => u.status === "rejected").length;

  // Group by event
  const grouped = filtered.reduce<Record<string, UploadWithMeta[]>>((acc, u) => {
    const key = u.eventTitle;
    if (!acc[key]) acc[key] = [];
    acc[key].push(u);
    return acc;
  }, {});

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Please sign in to access this page.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gallery Review</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Review and manage attendee photo uploads
              </p>
            </div>
            <Link
              to="/host/$hostSlug/dashboard"
              params={{ hostSlug }}
            >
              <Button variant="outline" size="sm">
                ← Dashboard
              </Button>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(
              [
                ["pending", pendingCount],
                ["approved", approvedCount],
                ["rejected", rejectedCount],
              ] as const
            ).map(([key, count]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
                {count > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-background/20 px-1.5 py-0.5 text-xs">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <p className="text-4xl mb-3">📷</p>
              <p className="text-muted-foreground">
                No {tab} photos to review.
              </p>
            </div>
          ) : (
            Object.entries(grouped).map(([eventTitle, items]) => (
              <div key={eventTitle} className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {eventTitle}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-border bg-card overflow-hidden shadow-sm"
                    >
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img
                          src={item.image_url}
                          alt="Attendee upload"
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.uploaderName}
                          </p>
                          <Badge
                            variant={
                              item.status === "approved"
                                ? "default"
                                : item.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <div className="flex gap-2 pt-1">
                          {item.status === "pending" && (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                className="flex-1"
                                disabled={actionLoading === item.id}
                                onClick={() => updateStatus(item.id, "approved")}
                              >
                                ✓ Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1"
                                disabled={actionLoading === item.id}
                                onClick={() => updateStatus(item.id, "rejected")}
                              >
                                ✗ Reject
                              </Button>
                            </>
                          )}
                          {item.status === "approved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              disabled={actionLoading === item.id}
                              onClick={() => updateStatus(item.id, "hidden")}
                            >
                              🚫 Hide
                            </Button>
                          )}
                          {item.status === "rejected" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              disabled={actionLoading === item.id}
                              onClick={() => updateStatus(item.id, "approved")}
                            >
                              ✓ Approve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
