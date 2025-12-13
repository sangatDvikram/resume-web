import React from "react";
import { WithStyles } from "@mui/styles";
import style from "./style";
import { withStyleComponent } from "../../utils/style";
import SectionHeader from "../SectionHeader";
import SectionBody from "../SectionBody";
import { RESUME } from "../../constants/resume";
import BulletList from "../BulletList";
import Bullet from "../Bullet";
import Link from "../Link";

type Props = WithStyles<typeof style>;
const Overview: React.FC<Props> = ({ classes }) => {
  return (
    <div className={classes.root}>
      <SectionHeader>Certifications</SectionHeader>
      <SectionBody>
        <BulletList>
          {RESUME.certifications.map((p) => (
            <Bullet key={p.title}>
              {p.title} -{" "}
              <Link href={p.link} underline external>
                <strong>{p.issuer}</strong>
              </Link>
            </Bullet>
          ))}
        </BulletList>
      </SectionBody>
    </div>
  );
};
export default withStyleComponent(style, "Overview")(Overview);
