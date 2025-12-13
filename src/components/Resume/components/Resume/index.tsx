import React, { useContext } from "react";
import { WithStyles } from "@mui/styles";
import style from "./style";
import { withStyleComponent } from "@/utils/style";
import Overview from "../Overview";
import Patents from "../Patents";
import Skills from "../Skills";
import Experience from "../Experience";
import Projects from "../Projects";
import Header from "../Header";
import Certification from "../Certification";
import Achivement from "../Achivement";
import Education from "../Education";
import Page from "../Page";
import { GlobalContext } from "@/constants/context";
import { Grid } from "@mui/material";

interface Props extends WithStyles<typeof style>, Record<string, any> {}
const Container: React.FC<Props> = ({ classes }) => {
  const global = useContext(GlobalContext);
  return (
    <div className={classes.root}>
      <Page>
        <Header global={global} />
        <Overview />
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <Patents />
            <Experience />
          </Grid>
          <Grid item xs={4}>
            <Skills />
            <Certification />
            <Achivement />
            <Education />
            <Projects />
          </Grid>
        </Grid>
      </Page>
    </div>
  );
};
export default withStyleComponent(style, "Container")(Container);
