import { createStyles } from "@mui/styles";
import { Theme } from "@mui/material";
import { FONT_BASE_PDF } from "../../utils/style";

const style = (theme: Theme) =>
  createStyles({
    root: {
      [theme.breakpoints.down("sm")]: {
        display: "flex",
        flexDirection: "row-reverse",
      },
    },
    title: {
      fontSize: theme.spacing( 2.5),
        "@media print": {
          fontSize: theme.toPt({ all: 1.25 }, FONT_BASE_PDF),
        },
      position: "relative",
      textAlign: "center",
      [theme.breakpoints.down("sm")]: {
        fontSize: theme.spacing(3),
        "@media print": {
          fontSize: theme.toPt({ all: 1.5 }, FONT_BASE_PDF),
        },
        textAlign: "left",
      },
    },
    img: {
      width: 100,
      "& img": {
        objectFit: "contain",
        width: 100,
        [theme.breakpoints.up("sm")]: {
          width: 50,
        },
      },
      "@media print": {
        display: "none",
      },
    },
  });

export default style;
