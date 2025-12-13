import React from "react";
import { WithStyles } from "@mui/styles";
import style from "./style";
import { withStyleComponent } from "@/utils/style";
import SectionHeader from "../SectionHeader";
import SectionBody from "../SectionBody";
import { RESUME } from "@/constants/resume";
import Bullet from "../Bullet";
import BulletList from "../BulletList";

type Props = WithStyles<typeof style>;
const Overview: React.FC<Props> = ({ classes }) => {
  return (
    <div className={classes.root}>
      <SectionHeader>Achievements</SectionHeader>
      <SectionBody>
        <BulletList>
          {RESUME.awards.map((p) => (
            <Bullet key={p.title}>
              {p.title} -{" "}
              <small>
                <i>{p.issuer}</i>
              </small>
            </Bullet>
          ))}
        </BulletList>
      </SectionBody>
    </div>
  );
};
export default withStyleComponent(style, "Overview")(Overview);
