import React from "react";
import { WithStyles } from "@mui/styles";
import style from "./style";
import { withStyleComponent } from "../../utils/style";

interface Props extends WithStyles<typeof style> {
  children: React.ReactNode;
}
const SectionHeader: React.FC<Props> = ({ classes, children }) => {
  return <div className={classes.sectionRoot}>{children}</div>;
};
export default withStyleComponent(style, "SectionHeader")(SectionHeader);
