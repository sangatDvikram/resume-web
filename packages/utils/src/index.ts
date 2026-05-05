// ─── Date & duration helpers ──────────────────────────────────────────────────
export {
  calculateDuration,
  yearsOfExperience,
  yearsOfExperienceString,
  formatNumberSuffix,
} from './date';
export type { Duration } from './date';

// ─── LaTeX resume generator ───────────────────────────────────────────────────
export { generateLatexResume } from './latex';
export type {
  LatexResumeData,
  LatexResumeProfile,
  LatexExperienceEntry,
  LatexEducationEntry,
} from './latex';
