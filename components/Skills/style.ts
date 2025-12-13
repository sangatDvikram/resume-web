import { createStyles } from "@mui/styles";
import { Theme } from "@mui/material";

const style = (theme: Theme) =>
  createStyles({
    root: {},
    body: {
      [theme.breakpoints.down("sm")]: {
        justifyContent: "flex-start",
        display: "flex",
        flexWrap: "wrap",
      },
    },
    section: {
      display: "inline-block",
      paddingRight: theme.spacing(1),
      marginBottom: theme.spacing(1),
      "& ul": {
        margin: 0,
        listStylePosition: "inside",
        paddingLeft: 0,
      },
      "& li": {
        margin: 0,
        float: "left",
        marginRight: theme.spacing(0.5),
        [theme.breakpoints.down("sm")]: {
          float: "unset",
        },
      },
      clear: "both",
      "& header": {
        fontWeight: "700",
      },
      "&:after": {
        content: ".",
        visibility: "hidden",
        display: "block",
        height: "0",
        clear: "both",
      },
    },
  });

export default style;
