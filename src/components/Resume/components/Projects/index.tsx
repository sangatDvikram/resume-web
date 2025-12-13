import React from "react";
import { WithStyles } from "@mui/styles";

import { Launch } from "@mui/icons-material";
import style from "./style";
import { withStyleComponent } from "@/utils/style";
import SectionHeader from "../SectionHeader";
import SectionBody from "../SectionBody";
import { RESUME } from "@/constants/resume";
import { calculateDuration } from "@/constants/date";
import Bullet from "../Bullet";
import BulletList from "../BulletList";
import Link from "../Link";

type Props = WithStyles<typeof style>;
const Overview: React.FC<Props> = ({ classes }) => {
  return (
    <div className={classes.root}>
      <SectionHeader>Freelancing Projects</SectionHeader>
      <SectionBody>
        <div>
          {RESUME.projects.map((p) => (
            <div key={p.title} className={classes.details}>
              <Link
                className={classes.title}
                href={p.link}
                title={p.title}
                underline
                external
              >
                {p.title}
              </Link>
              <div>
                <span className={classes.company}>{p.company}</span>
              </div>
              <BulletList>
                {p.tasks.map((t) => (
                  <Bullet key={t}>{t}</Bullet>
                ))}
              </BulletList>
              <small>
                Technologies used : <strong>{p.techStack.join(", ")}</strong>{" "}
              </small>
            </div>
          ))}
        </div>
      </SectionBody>
    </div>
  );
};
export default withStyleComponent(style, "Overview")(Overview);
