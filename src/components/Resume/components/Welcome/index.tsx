import React from "react";
import { WithStyles } from "@mui/styles";
import Link from "next/link";
import { Button, Typography } from "@mui/material";
import style from "./style";
import { withStyleComponent } from "@/utils/style";
import dynamic from "next/dynamic";

const HeroHeader = dynamic(() => import("../HeroHeader"), { ssr: false });
const IntroHero = dynamic(() => import("../IntroHero"), { ssr: false });

interface Props extends WithStyles<typeof style>, Record<string, any> {}
const Welcome: React.FC<Props> = ({ classes }) => {
  return (
    <div className={classes.root}>
      <HeroHeader />
      <main className={classes.main}>
        <IntroHero />
        <Typography className={classes.subtitle}>
          Welcome — I build web experiences and craft full-stack applications.
        </Typography>
        <Link href="/resume" passHref>
          <Button variant="contained" color="primary" className={classes.cta}>
            View Resume
          </Button>
        </Link>
      </main>
    </div>
  );
};

export default withStyleComponent(style, "Welcome")(Welcome);
