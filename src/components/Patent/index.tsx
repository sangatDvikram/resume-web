import React from "react";
import { WithStyles } from "@mui/styles";
import style from "./style";
import { withStyleComponent } from "../../utils/style";

interface Props extends WithStyles<typeof style> {
  children?: React.ReactNode;
}
const Container: React.FC<Props> = ({ classes }) => {
  return <span className={classes.root}>Container</span>;
};
export default withStyleComponent(style, "Container")(Container);
