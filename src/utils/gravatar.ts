import { GRAVATAR } from "../constants";

export const gravatar = (size = 200): string => `${GRAVATAR}?s=${size}`;