import React from "react";
import { WithStyles } from "@mui/styles";
import style from "./style";
import { withStyleComponent } from "../../utils/style";

interface Props extends WithStyles<typeof style> {
  children: React.ReactNode;
}
const Bullet: React.FC<Props> = ({ classes, children }) => {
  return (
    <tr className={classes.root}>
      <td className={classes.bullet}>⦁</td>
      <td>{children}</td>
    </tr>
  );
};
export default withStyleComponent(style, "Bullet")(Bullet);
