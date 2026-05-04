import Image from "next/image";

// Portfolio homepage — full implementation arrives in EPIC 4 (Dynamic Resume System)
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 section-container py-24">
      <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/30 glow">
        <Image
          src="/profile.jpeg"
          alt="Vikram Sangat"
          fill
          sizes="96px"
          className="object-cover"
          priority
        />
      </div>

      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-gradient">
          Vikram Sangat
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Software Engineer · Technical Lead · Inventor
        </p>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted-foreground">
        <span className="w-2 h-2 rounded-full bg-status-available animate-pulse-slow" />
        Available for opportunities
      </div>

      <p className="text-muted-foreground text-sm italic">
        Full portfolio coming soon — building something great.
      </p>
    </main>
  );
}
