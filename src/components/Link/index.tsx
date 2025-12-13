import React from "react";
import { WithStyles } from "@mui/styles";
import { Span } from "react-span";
import { Launch } from "@mui/icons-material";
import style from "./style";
import { withStyleComponent } from "../../utils/style";

interface Props extends WithStyles<typeof style> {
  children: React.ReactNode;
  href: string;
  underline?: boolean;
  external?: boolean;
  [name: string]: any;
}
const Container: React.FC<Props> = ({
  classes,
  href,
  children,
  underline,
  external,
  ...extra
}) => {
  let c = children;
  if (underline) {
    c = <u>{c}</u>;
  }
  return (
    <Span
      color="blue"
      className={classes.root}
      as="a"
      href={href}
      target="__blank"
      {...extra}
    >
      {c}{" "}
      {external && (
        <small>
          <Launch />
        </small>
      )}
    </Span>
  );
};
export default withStyleComponent(style, "Container")(Container);
