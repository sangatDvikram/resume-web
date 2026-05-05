import Image from "next/image";
import { getResume } from "@/lib/api";

// ISR: revalidate at most once every 60 seconds (on-demand via /api/revalidate)
export const revalidate = 60;

export default async function Home() {
  let resume;
  try {
    resume = await getResume();
  } catch {
    // Fallback UI when the API is unavailable (e.g. during local dev without DB)
    resume = null;
  }

  const profile = resume?.profile;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 section-container py-24">
      {/* Avatar */}
      <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/30 glow">
        <Image
          src={profile?.avatarUrl ?? "/profile.jpeg"}
          alt={profile?.name ?? "Profile photo"}
          fill
          sizes="96px"
          className="object-cover"
          priority
        />
      </div>

      {/* Name & position */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-gradient">
          {profile?.name ?? "Portfolio"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          {profile?.position ?? "Software Engineer"}
        </p>
      </div>

      {/* Bio */}
      {profile?.description && (
        <p className="max-w-xl text-center text-muted-foreground leading-relaxed">
          {profile.description}
        </p>
      )}

      {/* Years of experience badge */}
      {profile?.yearsOfExperienceString && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-status-available animate-pulse-slow" />
          {profile.yearsOfExperienceString} years of professional experience
        </div>
      )}

      {/* Social links */}
      {profile && (
        <div className="flex items-center gap-4 text-sm">
          {profile.linkedInUrl && (
            <a
              href={profile.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              LinkedIn
            </a>
          )}
          {profile.githubUrl && (
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          )}
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Email
            </a>
          )}
        </div>
      )}
    </main>
  );
}
