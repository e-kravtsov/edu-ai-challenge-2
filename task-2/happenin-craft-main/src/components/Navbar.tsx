import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [myHosts, setMyHosts] = useState<Array<{ slug: string; name: string; role: string }>>([]);

  useEffect(() => {
    if (!user) { setMyHosts([]); return; }
    (async () => {
      const { data } = await supabase
        .from("host_members")
        .select("role, hosts(slug, name)")
        .eq("user_id", user.id);
      const hosts = (data || [])
        .map((m: any) => m.hosts ? { slug: m.hosts.slug, name: m.hosts.name, role: m.role } : null)
        .filter(Boolean) as Array<{ slug: string; name: string; role: string }>;
      setMyHosts(hosts);
    })();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">Happenin</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/explore" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Explore</Link>
          {user && (
            <>
              <Link to="/tickets" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">My Tickets</Link>
              <Link to="/my-events" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">My Events</Link>
            </>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-hero text-xs font-bold text-primary-foreground">
                  {user.email?.charAt(0).toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{user.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/become-host" })}>Become a Host</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/tickets" })}>My Tickets</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/my-events" })}>My Events</DropdownMenuItem>
                {myHosts.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">My Hosts</div>
                    {myHosts.map(h => (
                      <DropdownMenuItem key={h.slug} onClick={() => navigate({ to: "/host/$hostSlug/dashboard", params: { hostSlug: h.slug } })}>
                        <span className="truncate">{h.name}</span>
                        <span className="ml-auto text-[10px] text-muted-foreground">{h.role}</span>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/signin"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link to="/signin"><Button variant="hero" size="sm">Get Started</Button></Link>
            </>
          )}
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground md:hidden" aria-label="Toggle menu">
          {mobileOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            <Link to="/explore" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Explore</Link>
            {user && (
              <>
                <Link to="/tickets" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">My Tickets</Link>
                <Link to="/my-events" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">My Events</Link>
              </>
            )}
          </nav>
          <div className="mt-3 flex flex-col gap-2">
            {user ? (
              <Button variant="ghost" size="sm" onClick={handleSignOut}>Sign Out</Button>
            ) : (
              <Link to="/signin"><Button variant="hero" size="sm" className="w-full">Sign In</Button></Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
