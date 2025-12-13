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
      pageBreakBefore: "auto",
      pageBreakAfter: "auto",
      pageBreakInside: "avoid",
      marginBottom: theme.spacing(1),
      "& small": {
        margin: theme.spacing(1, 0),
      },
    },
    title: {
      fontSize: theme.spacing( 14 / FONT_BASE),
      fontWeight: 700,
      [theme.breakpoints.down("sm")]: {
        fontSize: theme.spacing( 14 / FONT_BASE),
      },
      "@media print": {
        fontSize: theme.toPt({ all: 1 }, FONT_BASE_PDF),
      },
    },
    time: {
      fontSize: theme.spacing( 10 / FONT_BASE),
      "@media print": {
        fontSize: theme.toPt({ all: 1 }, FONT_BASE_PDF),
      },
    },
    company: {
      fontSize: theme.spacing( 10 / FONT_BASE),
      "@media print": {
        fontSize: theme.toPt({ all: 1 }, FONT_BASE_PDF),
      },
    },
    duration: {
      position: "absolute",
      top: 4,
      right: 0,
      fontWeight: 700,
      [theme.breakpoints.down("sm")]: {
        position: "relative",
        display: "block",
        marginBottom: theme.spacing(1),
      },
    },
    area: {
      fontSize:theme.spacing( 10 / FONT_BASE),
      "@media print": {
        fontSize: theme.toPt({ all: 1 }, FONT_BASE_PDF),
      },
      fontWeight: 700,
    },
    lastDetail: {
      "@media print": {
        // paddingTop: theme.toPt(4),
      },
    },
    lastDuration: {
      "@media print": {
        // top: `calc(${theme.toPt(4)} - 4px)`,
      },
    },
  });

export default style;
