import React, { useContext } from "react";
import { WithStyles } from "@mui/styles";
import style from "./style";
import { withStyleComponent } from "@/utils/style";
import Overview from "./components/Overview";
import Patents from "./components/Patents";
import Skills from "./components/Skills";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Header from "./components/Header";
import Certification from "./components/Certification";
import Achivement from "./components/Achivement";
import Education from "./components/Education";
import Page from "./components/Page";
import { GlobalContext } from "@/constants/context";
import { CssBaseline, Grid } from "@mui/material";

interface Props extends WithStyles<typeof style>, Record<string, any> {}
const Container: React.FC<Props> = ({ classes }) => {
  const global = useContext(GlobalContext);
  return (
    <div className={classes.root}>
      <CssBaseline />
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
