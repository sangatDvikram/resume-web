import React from "react";
import { WithStyles } from "@mui/styles";
import style from "./style";
import { withStyleComponent } from "../../utils/style";
import SectionHeader from "../SectionHeader";
import SectionBody from "../SectionBody";
import { RESUME } from "../../constants/resume";
import Bullet from "../Bullet";
import BulletList from "../BulletList";

type Props = WithStyles<typeof style>;
const Overview: React.FC<Props> = ({ classes }) => {
  return (
    <div className={classes.root}>
      <SectionHeader>Education</SectionHeader>
      <SectionBody>
        <BulletList>
          {RESUME.education.map((p) => (
            <Bullet key={p.degree}>
              <strong>{p.degree}</strong>
              <div>
                <i>{p.university}</i>
              </div>
              <div>
                <small>
                  <strong>{p.duration}</strong>
                </small>
              </div>
            </Bullet>
          ))}
        </BulletList>
      </SectionBody>
    </div>
  );
};
export default withStyleComponent(style, "Overview")(Overview);
