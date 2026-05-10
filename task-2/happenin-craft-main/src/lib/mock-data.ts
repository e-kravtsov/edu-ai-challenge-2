export interface EventData {
  id: string;
  slug: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  venueType: "physical" | "online";
  venueAddress?: string;
  onlineUrl?: string;
  capacity: number;
  goingCount: number;
  coverImageUrl: string;
  hostName: string;
  hostSlug: string;
  hostLogoUrl?: string;
  visibility: "public" | "unlisted";
  state: "draft" | "published";
  pricingMode: "free" | "paid";
}

// Use fixed dates to avoid SSR hydration mismatch
export const mockEvents: EventData[] = [
  {
    id: "1",
    slug: "summer-music-fest-2026",
    title: "Summer Music Fest 2026",
    description: "A vibrant outdoor music festival featuring local artists, food vendors, and community spirit. Join us for an unforgettable evening under the stars.",
    startsAt: "2026-05-18T18:00:00Z",
    endsAt: "2026-05-18T23:00:00Z",
    venueType: "physical",
    venueAddress: "Central Park, New York, NY",
    capacity: 500,
    goingCount: 342,
    coverImageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop",
    hostName: "NYC Events Collective",
    hostSlug: "nyc-events",
    visibility: "public",
    state: "published",
    pricingMode: "free",
  },
  {
    id: "2",
    slug: "design-systems-workshop",
    title: "Design Systems Workshop",
    description: "Learn to build scalable design systems from scratch. Hands-on workshop with industry experts covering tokens, components, and documentation.",
    startsAt: "2026-05-11T14:00:00Z",
    endsAt: "2026-05-11T18:00:00Z",
    venueType: "online",
    onlineUrl: "https://meet.example.com/design-workshop",
    capacity: 100,
    goingCount: 87,
    coverImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
    hostName: "Creative Lab",
    hostSlug: "creative-lab",
    visibility: "public",
    state: "published",
    pricingMode: "free",
  },
  {
    id: "3",
    slug: "community-run-5k",
    title: "Community Run 5K",
    description: "Lace up your running shoes for a fun, non-competitive 5K through the neighborhood. All fitness levels welcome. Refreshments provided!",
    startsAt: "2026-05-25T09:00:00Z",
    endsAt: "2026-05-25T11:00:00Z",
    venueType: "physical",
    venueAddress: "Riverside Trail, Austin, TX",
    capacity: 200,
    goingCount: 156,
    coverImageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=400&fit=crop",
    hostName: "Austin Runners Club",
    hostSlug: "austin-runners",
    visibility: "public",
    state: "published",
    pricingMode: "free",
  },
  {
    id: "4",
    slug: "open-mic-night",
    title: "Open Mic Night",
    description: "Share your talent or just enjoy the show! Poetry, comedy, music — all are welcome. A safe and supportive space for creative expression.",
    startsAt: "2026-05-07T19:00:00Z",
    endsAt: "2026-05-07T22:00:00Z",
    venueType: "physical",
    venueAddress: "The Rustic Cafe, Portland, OR",
    capacity: 60,
    goingCount: 60,
    coverImageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop",
    hostName: "Portland Arts",
    hostSlug: "portland-arts",
    visibility: "public",
    state: "published",
    pricingMode: "free",
  },
  {
    id: "5",
    slug: "tech-meetup-ai",
    title: "AI & The Future of Work",
    description: "Join industry leaders for a panel discussion on how AI is reshaping the workplace. Networking, Q&A, and light refreshments included.",
    startsAt: "2026-05-14T17:00:00Z",
    endsAt: "2026-05-14T20:00:00Z",
    venueType: "physical",
    venueAddress: "Innovation Hub, San Francisco, CA",
    capacity: 150,
    goingCount: 98,
    coverImageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop",
    hostName: "SF Tech Community",
    hostSlug: "sf-tech",
    visibility: "public",
    state: "published",
    pricingMode: "free",
  },
  {
    id: "6",
    slug: "yoga-in-the-park",
    title: "Yoga in the Park",
    description: "Start your weekend right with a peaceful outdoor yoga session. Bring your own mat. Suitable for all levels from beginners to advanced.",
    startsAt: "2026-05-02T08:00:00Z",
    endsAt: "2026-05-02T09:30:00Z",
    venueType: "physical",
    venueAddress: "Golden Gate Park, San Francisco, CA",
    capacity: 80,
    goingCount: 72,
    coverImageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop",
    hostName: "Mindful Movement",
    hostSlug: "mindful-movement",
    visibility: "public",
    state: "published",
    pricingMode: "free",
  },
];

export function isEventPast(event: EventData): boolean {
  return new Date(event.endsAt) < new Date();
}

export function isEventFull(event: EventData): boolean {
  return event.goingCount >= event.capacity;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function formatEventTime(dateStr: string): string {
  const d = new Date(dateStr);
  let h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
}
