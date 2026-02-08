import { format, isValid, lastDayOfMonth, intervalToDuration } from "date-fns";
import { formatNumberSuffix } from "../utils/general";
const CAREER_START_DATE = new Date(2016, 6, 1);

const yearsOfExperience = (
  startDate = CAREER_START_DATE,
  endDate = new Date()
) => {
  const difference = intervalToDuration({
    start: startDate,
    end: endDate,
  });

  const months = `${difference.months} ${formatNumberSuffix(
    difference.months as number,
    "month"
  )}`;
  return `${difference.years} ${formatNumberSuffix(
    difference.years as number,
    "year"
  )} ${(difference.months as number) > 0 ? months : ""} `;
};
export const calculateDuration = (data: any) => {
  const { duration, isCurrent = false } = data;
  const lastDay = lastDayOfMonth(duration[1]);

  let dateFormat = format(duration[0], "MMMM yyyy");
  if (!isCurrent && isValid(lastDay)) {
    dateFormat += ` - ${format(lastDay, "MMMM yyyy")}`;
  }
  if (isCurrent) {
    dateFormat += " - present";
  }

  return dateFormat;
};
export default yearsOfExperience;
