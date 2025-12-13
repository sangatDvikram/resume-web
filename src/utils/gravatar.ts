import { GRAVATAR } from "../constants/variables";

export const gravatar = (size = 200): string => `${GRAVATAR}?s=${size}` 