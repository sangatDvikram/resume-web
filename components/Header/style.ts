import { createStyles, Theme } from "@material-ui/core";

const style = (theme: Theme) =>
  createStyles({
    headerRoot: {
      display: "block",
      position: "relative",
      minWidth: "100%",
      paddingBottom: theme.toPt(1),
      marginBottom: theme.toPt(1),
      borderBottom: "2px solid black",
    },
  });

export default style;
