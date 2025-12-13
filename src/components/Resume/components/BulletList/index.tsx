import React from "react";
import { WithStyles } from "@mui/styles";
import style from "./style";
import { withStyleComponent } from "@/utils/style";

interface Props extends WithStyles<typeof style> {
  children: React.ReactNode;
}
const BulletList: React.FC<Props> = ({ classes, children }) => {
  return (
    <table className={classes.root}>
      <tbody>{children}</tbody>
    </table>
  );
};
export default withStyleComponent(style, "BulletList")(BulletList);
