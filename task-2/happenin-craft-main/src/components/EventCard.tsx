import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { formatEventDate, formatEventTime } from "@/lib/mock-data";

export interface EventCardData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  coverImageUrl: string | null;
  venueType: string;
  venueAddress: string | null;
  capacity: number;
  goingCount?: number;
  pricingMode?: string;
}

export function EventCard({ event }: { event: EventCardData }) {
  const isPast = new Date(event.endsAt) < new Date();
  const isFull = (event.goingCount ?? 0) >= event.capacity;

  return (
    <Link
      to="/events/$slug"
      params={{ slug: event.slug }}
      className="group block overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5"
    >
      <div className="relative aspect-[2/1] overflow-hidden">
        {event.coverImageUrl ? (
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-warm text-4xl">🎉</div>
        )}
        {isPast && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/50">
            <Badge variant="secondary" className="bg-background/90 text-foreground font-semibold text-xs">
              Ended
            </Badge>
          </div>
        )}
        {!isPast && isFull && (
          <Badge variant="destructive" className="absolute right-3 top-3 text-xs">
            Full
          </Badge>
        )}
        {!isPast && (event.pricingMode === "free" || !event.pricingMode) && (
          <Badge className="absolute left-3 top-3 bg-success text-success-foreground text-xs">
            Free
          </Badge>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-primary font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          </svg>
          {formatEventDate(event.startsAt)} · {formatEventTime(event.startsAt)}
        </div>
        <h3 className="mt-1.5 text-base font-semibold text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
            </svg>
            {event.venueType === "online" ? "Online" : (event.venueAddress || "TBA")}
          </div>
          {event.goingCount !== undefined && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {event.goingCount}/{event.capacity}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
