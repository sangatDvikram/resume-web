import { createStyles, Theme } from "@material-ui/core";

const style = (theme: Theme) =>
  createStyles({
    root: {},
    title: {
      fontSize: theme.toPt(2.5),
      position: "relative",
      textAlign: "center",
      [theme.breakpoints.down("xs")]: {
        fontSize: theme.toPt(3),
        textAlign: "left",
      },
    },
    img: {
      position: "absolute",
      left: 0,
      width: 100,
      "& img": {
        objectFit: "contain",
        width: 100,
        [theme.breakpoints.up("sm")]: {
          width: 50,
        },
      },
      "@media print": {
        display: "none",
      },
      [theme.breakpoints.down("xs")]: {
        right: 0,
        left: "unset",
      },
    },
  });

export default style;
