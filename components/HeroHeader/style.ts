import { createStyles } from "@mui/styles";
import { Theme } from "@mui/material";
import { BLACK_BACKGROUND, WHITE } from "../../constants/colors";

const style = (theme: Theme) =>
  createStyles({
    headerRoot: {
      display: "flex",
      flexDirection: "column",
      position: "relative",
      minWidth: "100vw",
      minHeight: "100vh",
      background: BLACK_BACKGROUND,
    },
    container: {
      color: WHITE,
      flexGrow: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
  });

export default style;
