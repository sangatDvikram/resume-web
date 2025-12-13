import { createStyles } from "@mui/styles";
import { Theme } from "@mui/material";
import {
  PAGE_HEIGHT,
  PAGE_PADDING_PT,
  PAGE_FONT_SIZE,
  PAGE_WIDTH,
} from "../../constants/variables";
import { BLACK_BACKGROUND } from "../../constants/colors";

const style = (theme: Theme) =>
  createStyles({
    "@global": {
      body: {
        fontSize: PAGE_FONT_SIZE,
      },
    },
    root: {
     
    },
  });

export default style;
