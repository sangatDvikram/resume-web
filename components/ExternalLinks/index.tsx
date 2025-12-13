import React, { useContext } from "react";
import { WithStyles } from "@mui/styles";
import { GitHub, Language, LinkedIn } from "@mui/icons-material";
import { get } from "lodash-es";
import style from "./style";
import { withStyleComponent } from "../../utils/style";
import {
  KEYMAPPING,
} from "../../constants/variables";
import Link from "../Link";
import { GlobalContext } from "../../constants/context";

type Props = WithStyles<typeof style>;
const Container: React.FC<Props> = ({ classes }) => {
  const global = useContext(GlobalContext);
  const contactDetails = get(global, KEYMAPPING.contact_details, []) || [];
  let linkedIn: Record<string, any> = {};
  let github: Record<string, any> = {};
  let website: Record<string, any> = {};
  contactDetails.forEach((c: any) => {
    if (c.type === "linkedIn") {
      linkedIn = c;
    }
    if (c.type === "github") {
      github = c;
    }
    if (c.type === "website") {
      website = c;
    }
  });
  return (
    <span className={classes.root}>
      <Link href={linkedIn.link} target="__blank" title="Vikram's Profile">
        <LinkedIn />
      </Link>
      <Link href={github.link} target="__blank" title="Vikram's Github">
        <GitHub />
      </Link>
      <Link href={website.link} target="__blank" title="Vikram's Website">
        <Language />
      </Link>
    </span>
  );
};
export default withStyleComponent(style, "Container")(Container);
