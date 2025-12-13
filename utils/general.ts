export const formatOrdinal = (n: number) => {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

export const formatNumberSuffix = (n: number, inputString: string) => {
  return inputString + (n > 1 ? "s" : "");
}
