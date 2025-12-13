import { createTheme, Theme } from "@mui/material";
import { red } from "@mui/material/colors";
import { ToPT, toIn, toPt } from "../utils/style";

declare module "@mui/material" {
  interface Theme {
    toPt: typeof toPt;
    toIn: ToPT;
  }
  interface ThemeOptions {
    toPt: typeof toPt;
    toIn: ToPT;
  }
}

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: "#2C27C7",
    },
    secondary: {
      main: "#1EFAE4",
    },
    error: {
      main: red.A400,
    },
    background: {
      default: "#fff",
    },
  },
  typography: {
    fontFamily: '"Lato","Roboto", "Helvetica", "Arial", sans-serif',
  },
  toIn,
  toPt,
});

export default theme;
