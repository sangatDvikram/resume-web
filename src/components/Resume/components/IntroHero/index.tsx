import React, { useContext } from "react";
import { WithStyles } from "@mui/styles";
import { Typography } from "@mui/material";
import { get } from "lodash-es";
import style from "./style";
import { GlobalContext } from "@/constants/context";
import { withStyleComponent } from "@/utils/style";
import { KEYMAPPING } from "@/constants/variables";

interface Props extends WithStyles<typeof style>, Record<string, any> {}
const Container: React.FC<Props> = ({ classes }) => {
  const global = useContext(GlobalContext);
  const profileImage = get(global, "profile.favicon.url", "") || "";
  const name = get(global, KEYMAPPING.name, "") || "";
  return (
    <div className={classes.root}>
      <Typography className={classes.title}>{name}</Typography>
    </div>
  );
};
export default withStyleComponent(style, "Container")(Container);
