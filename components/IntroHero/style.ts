import { createStyles } from "@mui/styles";
import { Theme } from "@mui/material";

const style = (theme: Theme) =>
  createStyles({
    root: {
      [theme.breakpoints.down("sm")]: {
        display: "flex",
        flexDirection: "row-reverse",
      },
    },
    title: {
      fontSize: theme.toPt(2.5),
      position: "relative",
      textAlign: "center",
      [theme.breakpoints.down("sm")]: {
        fontSize: theme.toPt(3),
        textAlign: "left",
      },
    },
  });

export default style;
