import { createStyles } from "@mui/styles";
import { Theme } from "@mui/material";
import {
  PAGE_WIDTH,
  PAGE_PADDING_PT,
  PAGE_FONT_SIZE,
  PAGE_HEIGHT,
} from "@/constants/variables";
import { FONT_BASE_PDF } from "@/utils/style";

const style = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      "@media print": {
        width: PAGE_WIDTH,
        padding:  theme.toPt({ all: 0 }, FONT_BASE_PDF),
        display: "block",
        fontSize: theme.toPt({ all: 1 }, FONT_BASE_PDF),
        minHeight: PAGE_HEIGHT,
        margin: 0,
      },
    },
  });

export default style;
