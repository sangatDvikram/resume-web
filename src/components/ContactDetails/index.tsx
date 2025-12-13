import React, { useContext } from "react";
import { WithStyles } from "@mui/styles";
import { Email, Phone, LocationOn } from "@mui/icons-material";
import { get } from "lodash-es";
import style from "./style";

import { withStyleComponent } from "../../utils/style";
import Link from "../Link";
import { GlobalContext } from "../../constants/context";
import { KEYMAPPING } from "../../constants/variables";

type Props = WithStyles<typeof style>;
const Container: React.FC<Props> = ({ classes }) => {
  const global = useContext(GlobalContext);
  const contactDetails = get(global, KEYMAPPING.contact_details, []) || [];
  let phone: Record<string, any> = {};
  let email: Record<string, any> = {};
  let location: Record<string, any> = {};
  contactDetails.forEach((c: any) => {
    if (c.type === "phone") {
      phone = c;
    }
    if (c.type === "email") {
      email = c;
    }
    if (c.type === "location") {
      location = c;
    }
  });
  return (
    <div className={classes.root}>
      <a href={`${phone.link}`} title="Contact Vikram">
        <Phone className={classes.icon} /> {phone.details}
      </a>
      <span>
       
          <span className={classes.dash}>-</span>{" "}
        
        <u>
          <Link href={`${email.link}`} title="Contact Vikram">
            <Email className={classes.icon} /> {email.details}
          </Link>
        </u>
      </span>
      <span>
       
          <span className={classes.dash}>-</span>
        
        <span>
          <LocationOn className={classes.icon} /> {location.details}
        </span>
      </span>
    </div>
  );
};
export default withStyleComponent(style, "Container")(Container);
