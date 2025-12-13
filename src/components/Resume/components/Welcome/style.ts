import { createStyles } from "@mui/styles";
import { Theme } from "@mui/material";

const style = (theme: Theme) =>
  createStyles({
    "@global": {
      body: {
        margin: 0,
      },
    },
    root: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: theme.palette.background.default,
    },
    main: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing(4),
      gap: theme.spacing(2),
      textAlign: "center",
    },
    subtitle: {
      color: theme.palette.text.secondary,
      maxWidth: 680,
    },
    cta: {
      marginTop: theme.spacing(1),
    },
  });

export default style;
