import React, { useContext } from "react";
import { WithStyles } from "@mui/styles";
import { get } from "lodash-es";
import style from "./style";
import { withStyleComponent } from "@/utils/style";
import SectionHeader from "../SectionHeader";
import BulletList from "../BulletList";
import Bullet from "../Bullet";
import SectionBody from "../SectionBody";
import Link from "../Link";
import { GlobalContext } from "@/constants/context";
import { KEYMAPPING } from "@/constants/variables";

type Props = WithStyles<typeof style>;
const Overview: React.FC<Props> = ({ classes }) => {
  const global = useContext(GlobalContext);
  const patents = get(global, KEYMAPPING.patents, []) || [];
  return (
    <div className={classes.root}>
      <SectionHeader>Patents</SectionHeader>
      <SectionBody>
        <BulletList>
          {patents.map((p: any) => (
            <Bullet key={p.link}>
              {p.title} -{" "}
              <Link href={p.url} underline external title={p.title}>
                <strong>{p.patent_number}</strong>
              </Link>
            </Bullet>
          ))}
        </BulletList>
      </SectionBody>
    </div>
  );
};
export default withStyleComponent(style, "Overview")(Overview);
