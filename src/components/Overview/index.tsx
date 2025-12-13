import React, { useContext } from "react";
import { WithStyles } from "@mui/styles";
import { get } from "lodash-es";
import style from "./style";
import SectionHeader from "../SectionHeader";
import SectionBody from "../SectionBody";
import { GlobalContext } from "../../constants/context";
import { withStyleComponent } from "../../utils/style";
import { KEYMAPPING } from "../../constants/variables";

type Props = WithStyles<typeof style>;
const Overview: React.FC<Props> = ({ classes }) => {
  const global = useContext(GlobalContext);
  const description = get(global, KEYMAPPING.description, "") || "";
  return (
    <div className={classes.root}>
      <SectionHeader>Overview</SectionHeader>
      <SectionBody>{description}</SectionBody>
    </div>
  );
};
export default withStyleComponent(style, "Overview")(Overview);
