import { withStyles } from "@mui/styles";
import { castArray } from "lodash-es";

export const withStyleComponent = (style: any, name: string) => {
  return withStyles(style, { name });
};
export const FONT_BASE = 8;
export const FONT_BASE_PDF = 8;
export type ToPT =
  | ((value: number) => string)
  | ((top: number, right?: number) => string)
  | ((top: number, right?: number, bottom?: number) => string)
  | ((top: number, right?: number, bottom?: number, left?: number) => string);

const convert = (number = 0, base = 8) => {
  return `${number * base}pt`;
};

const convertIn = (number = 0) => {
  return `${number * 8}in`;
};

export interface ToPTStyles {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
  all?: number;
  x?: number;
  y?: number;
}
export const toPt = (
  {
    top = 0,
    right = 0,
    bottom = 0,
    left = 0,
    all = 0,
    x = 0,
    y = 0,
  }: ToPTStyles,
  base = FONT_BASE
) => {
  let numbers: Array<string> = [];
  numbers.push(convert(top, base));
  numbers.push(convert(left, base));
  numbers.push(convert(bottom, base));
  numbers.push(convert(right, base));

  if (all > 0) {
    numbers = castArray(convert(all, base));
  }

  if (x || y) {
    numbers = [convert(y, base), convert(x, base)];
  }

  return numbers.join(" ");
};

export const toIn: ToPT = (
  top = 0,
  right?: number,
  bottom?: number,
  left?: number
) => {
  const numbers: Array<string> = [convertIn(top)];
  if (right !== undefined) {
    numbers.push(convertIn(right));
  }
  if (bottom !== undefined) {
    numbers.push(convertIn(bottom));
  }
  if (left !== undefined) {
    numbers.push(convertIn(left));
  }
  return numbers.join(" ");
};
