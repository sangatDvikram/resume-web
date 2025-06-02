import { createStyles } from "@mui/styles";
import { Theme } from "@mui/material";
import { FONT_BASE, FONT_BASE_PDF } from "../../utils/style";

const style = (theme: Theme) =>
  createStyles({
    root: {
      display: "block",
      fontSize: theme.spacing( 8/ FONT_BASE),
      "@media print": {
        fontSize: theme.toPt({ all: 1 }, FONT_BASE_PDF),
      },
      padding: theme.spacing(0.5),
      textAlign: "justify",
      "&:after, &:before": {
        content: ".",
        visibility: "hidden",
        display: "block",
        height: 0,
        clear: "both",
      },
    },
  });

export default style;
