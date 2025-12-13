import { createStyles } from "@mui/styles";
import { Theme } from "@mui/material";

const style = (theme: Theme) =>
  createStyles({
    headerRoot: {
      display: "flex",
      position: "relative",
      minWidth: "100%",
      paddingBottom: theme.spacing(1),
      marginBottom: theme.spacing(1),
      borderBottom: "2px solid black",
      [theme.breakpoints.down("sm")]: {
        flexDirection: "row-reverse",
      },
    },
  });

export default style;
