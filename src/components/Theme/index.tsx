import React from "react";
import { WithStyles } from "@mui/styles";
import { Theme } from "react-span";
import style from "./style";
import { withStyleComponent } from "../../utils/style";
import theme from "./theme";

interface Props extends WithStyles<typeof style> {
  children?: React.ReactNode;
}
const Container: React.FC<Props> = ({ children }) => {
  return <Theme theme={theme}>{children}</Theme>;
};
export default withStyleComponent(style, "Theme")(Container);
