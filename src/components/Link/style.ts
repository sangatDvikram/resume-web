import { createStyles } from "@mui/styles";
import { Theme } from "@mui/material";

const style = (theme: Theme) =>
  createStyles({
    root: {
      "&  small>svg": {
        fontSize: 12,
      },
    },
  });

export default style;
