import { createStyles } from "@mui/styles";
import { Theme } from "@mui/material";
import {
  PAGE_HEIGHT,
  PAGE_PADDING_PT,
  PAGE_FONT_SIZE,
  PAGE_WIDTH,
} from "@/constants/variables";
import { FONT_BASE_PDF } from "@/utils/style";

const style = (theme: Theme) =>
  createStyles({
    "@global": {
      body: {
        fontSize: theme.spacing(1),
        "@media print": {
          width: PAGE_WIDTH,
          display: "block",
          fontSize: theme.toPt({all:1}, FONT_BASE_PDF),
          minHeight: PAGE_HEIGHT,
          margin: 0,
        },
      },
    },
    root: {},
  });

export default style;
