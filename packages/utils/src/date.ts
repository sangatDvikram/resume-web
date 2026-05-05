/**
 * Date & duration utilities shared across apps/api and apps/web.
 *
 * NOTE: These are the canonical implementations.  EPIC 3 (E3-S5) will remove
 * any remaining duplicates from the old src/ Vite app and update all import
 * sites to point here.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Duration {
  years: number;
  months: number;
  /** Human-readable string, e.g. "2 yrs 3 mos" */
  label: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Calculate the duration between two dates.
 *
 * @param startDate  ISO-8601 date string or Date object.
 * @param endDate    ISO-8601 date string or Date object. Defaults to today.
 */
export function calculateDuration(
  startDate: string | Date,
  endDate: string | Date = new Date(),
): Duration {
  const start = new Date(startDate);
  const end = new Date(endDate);

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const yearPart = years > 0 ? `${years} yr${years !== 1 ? 's' : ''}` : '';
  const monthPart =
    months > 0 ? `${months} mo${months !== 1 ? 's' : ''}` : '';
  const label =
    [yearPart, monthPart].filter(Boolean).join(' ') || 'Less than a month';

  return { years, months, label };
}

/**
 * Return total years of professional experience from a career-start date.
 *
 * @param careerStartDate ISO-8601 date string or Date object.
 */
export function yearsOfExperience(careerStartDate: string | Date): number {
  return calculateDuration(careerStartDate).years;
}

/**
 * Return total experience as a human-readable string.
 * e.g. "8+ years"
 *
 * @param careerStartDate ISO-8601 date string or Date object.
 */
export function yearsOfExperienceString(careerStartDate: string | Date): string {
  const { years } = calculateDuration(careerStartDate);
  return `${years}+ year${years !== 1 ? 's' : ''}`;
}

/**
 * Format a number with its ordinal suffix.
 * e.g. 1 → "1st", 2 → "2nd", 3 → "3rd", 4 → "4th"
 */
export function formatNumberSuffix(n: number): string {
  const abs = Math.abs(n);
  const mod100 = abs % 100;
  const mod10 = abs % 10;

  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  if (mod10 === 1) return `${n}st`;
  if (mod10 === 2) return `${n}nd`;
  if (mod10 === 3) return `${n}rd`;
  return `${n}th`;
}
