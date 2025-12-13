import { createStyles } from "@mui/styles";
import { Theme } from "@mui/material";
import { FONT_BASE } from "@/utils/style";

const style = (theme: Theme) =>
  createStyles({
    root: {},
    bullet: {
      verticalAlign: "baseline",
      fontSize: theme.spacing(2),
      lineHeight: 1,
      "@media print": {
        fontSize: theme.toPt({ all: 1 }),
      },
    },
  });

export default style;
