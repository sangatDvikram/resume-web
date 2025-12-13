import React, { useContext } from "react";
import dynamic from "next/dynamic";
import { WithStyles } from "@mui/styles";
import style from "./style";
import { withStyleComponent } from "../../utils/style";
const HeroHeader = dynamic(() => import("../HeroHeader"), {
  ssr: false,
});
interface Props extends WithStyles<typeof style>, Record<string, any> {}
const Container: React.FC<Props> = ({ classes }) => {
  return (
    <div className={classes.root}>
        <HeroHeader />
    </div>
  );
};
export default withStyleComponent(style, "Container")(Container);
