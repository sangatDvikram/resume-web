import { createStyles } from "@mui/styles";
import { Theme } from "@mui/material";
import { FONT_BASE, FONT_BASE_PDF } from "../../utils/style";

const style = (theme: Theme) =>
  createStyles({
    sectionRoot: {
      fontSize: theme.spacing( 14/FONT_BASE),
      "@media print": {
        fontSize: theme.toPt({ all: 1 }, FONT_BASE_PDF),
      },
      fontWeight: 700,
      position: "relative",
      display: "inline-block",
      marginBottom: theme.spacing(1),
      "&::after": {
        content: '" "',
        bottom: theme.spacing(-0.5),
        left: 0,
        width: "50%",
        height: 2,
        position: "absolute",
        background: "black",
      },
    },
  });

export default style;
