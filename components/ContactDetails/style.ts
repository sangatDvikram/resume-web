import { createStyles } from "@mui/styles";
import { Theme } from "@mui/material";
import { FONT_BASE, FONT_BASE_PDF } from "../../utils/style";

const style = (theme: Theme) =>
  createStyles({
    root: {
      textAlign: "center",
      "& > *": {
        marginRight: theme.spacing(1),
        fontSize: theme.spacing( 10 / FONT_BASE),
        "@media print": {
          fontSize: theme.toPt({ all: 1 }, FONT_BASE_PDF),
        },
      },
      [theme.breakpoints.down("sm")]: {
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
      },
    },
    icon: {
      fontSize: theme.spacing( 12 / FONT_BASE),
      "@media print": {
        fontSize: theme.toPt({ all: 1 }, FONT_BASE_PDF),
      },
      marginBottom: -4,
    },
    dash: {
      [theme.breakpoints.down("sm")]: {
        display: "none",
      },
    },
  });

export default style;
