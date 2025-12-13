import { createStyles } from "@mui/styles";
import { Theme } from "@mui/material";
import { FONT_BASE, FONT_BASE_PDF } from "@/utils/style";

const style = (theme: Theme) =>
  createStyles({
    root: {
      position: "absolute",
      right: 0,
      top: 0,
      paddingTop: theme.spacing(1),
      verticalAlign: "middle",
      "& *": {
        float: "left",
        fontSize: theme.spacing( 18 / FONT_BASE),
        "@media print": {
          fontSize: theme.toPt({ all: 2 }, FONT_BASE_PDF),
        },
        marginRight: theme.spacing(1),
      },
      [theme.breakpoints.down("sm")]: {
        position: "relative",
        transform: "none",
        top: 0,
        paddingTop: theme.spacing(2),
        right: 0,
        "& *": {
          float: "none",
          fontSize: theme.spacing( 18 / FONT_BASE),
          "@media print": {
            fontSize: theme.toPt({ all: 2 }, FONT_BASE_PDF),
          },
          marginRight: theme.spacing(1),
        },
      },
    },
  });

export default style;
