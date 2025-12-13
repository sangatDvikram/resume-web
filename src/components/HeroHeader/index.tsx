import React, { useContext } from "react";
import { WithStyles } from "@mui/styles";
import Link from 'next/link'
import style from "./style";
import { withStyleComponent } from "../../utils/style";
import { useSelector } from "react-redux";
import { getResumeDetails } from "../../redux/slices/root.selector";
import { AppBar, Avatar, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";
import { gravatar } from "../../utils/gravatar";

interface Props extends WithStyles<typeof style>, Record<string, any> {}
const HeroHeader: React.FC<Props> = ({ classes }) => {
  const global = useSelector(getResumeDetails);
  return (
    <div className={classes.headerRoot}>
      <AppBar color="primary" position="relative">
        <Toolbar>
          <IconButton>
            <Avatar>
              <img src={gravatar(45)} alt={global.name} width={45} />
            </Avatar>
          </IconButton>
          <Typography variant="h6" sx={{flexGrow:1}}> {global.name} </Typography>
          <Link href='/resume'> 
          <Button color='inherit'>Resume</Button>
          </Link>
        </Toolbar>
      </AppBar>
      <Box className={classes.container}>
        <Typography>Hello I am {global.name} </Typography>
      </Box>
    </div>
  );
};
export default withStyleComponent(style, "HeroHeader")(HeroHeader);
