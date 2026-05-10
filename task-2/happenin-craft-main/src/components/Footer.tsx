import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-hero">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-foreground">Happenin</span>
          </div>
          <nav className="flex gap-6">
            <Link to="/explore" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Explore</Link>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">About</a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Privacy</a>
          </nav>
          <p className="text-xs text-muted-foreground">© 2026 Happenin. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
