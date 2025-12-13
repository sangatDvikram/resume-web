import { createStyles } from "@mui/styles";
import { Theme } from "@mui/material";
import { FONT_BASE, FONT_BASE_PDF } from "@/utils/style";

const style = (theme: Theme) =>
  createStyles({
    root: {
      "& ul": {
        margin: 0,
        listStylePosition: "inside",
        paddingLeft: 0,
      },
      "& li": {
        margin: 0,
        pageBreakInside: "avoid",
      },
    },
    details: {
      position: "relative",
      pageBreakInside: "avoid",
      pageBreakBefore: "auto",
      paddingBottom: theme.spacing(1),
      "& small": {
        margin: theme.spacing(1, 0),
      },
    },
    title: {
      fontSize: theme.spacing(10/FONT_BASE),
      "@media print": {
        fontSize: theme.toPt({ all: 1 }, FONT_BASE_PDF),
      },
      fontWeight: 700,
      "& svg": {
        fontSize: theme.spacing(1),
        "@media print": {
          fontSize: theme.toPt({ all: 0.5 }, FONT_BASE_PDF),
        },
        margin: theme.spacing(0, 1),
      },
    },
    time: {
      fontSize: theme.spacing( 10 / FONT_BASE ),
      "@media print": {
        fontSize: theme.toPt({ all: 1 }, FONT_BASE_PDF),
      },
    },
    company: {
      fontSize: theme.spacing(10 / FONT_BASE ),
      "@media print": {
        fontSize: theme.toPt({ all: 1 }, FONT_BASE_PDF),
      },
    },
    duration: {
      position: "absolute",
      top: 4,
      right: 0,
      fontWeight: 700,
    },
    area: {
      fontSize: theme.spacing(10),
      "@media print": {
        fontSize: theme.toPt({ all: 1 }, FONT_BASE_PDF),
      },
      fontWeight: 700,
    },
  });

export default style;
