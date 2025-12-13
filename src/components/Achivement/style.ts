import { createStyles } from "@mui/styles";
import { Theme } from "@mui/material";

const style = (theme: Theme) =>
  createStyles({
    root: {
      "& ul": {
        margin: 0,
        listStylePosition: "inside",
        paddingLeft: 0,
      },
      "& li": {
        margin: 0,
      },
    },
  });

export default style;
