import React, { useContext } from "react";
import { WithStyles } from "@mui/styles";
import style from "./style";
import { withStyleComponent } from "../../utils/style";
import ContactDetails from "../ContactDetails";
import IntroHero from "../IntroHero";
import ExternalLinks from "../ExternalLinks";
import { GlobalContext } from "../../constants/context";
import ProfileImage from "../ProfileImage";

interface Props extends WithStyles<typeof style>, Record<string, any> {}
const Header: React.FC<Props> = ({ classes }) => {
  const global = useContext(GlobalContext);
  return (
    <div className={classes.headerRoot}>
      <div>
        <ProfileImage></ProfileImage>
      </div>
      <div style={{ flexGrow: 1 }}>
        <IntroHero global={global} />
        <ContactDetails />
        <ExternalLinks />
      </div>
    </div>
  );
};
export default withStyleComponent(style, "Header")(Header);
