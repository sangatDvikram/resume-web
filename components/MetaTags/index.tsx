import { get } from "lodash-es";
import type { NextPage } from "next";
import Head from "next/head";
import { KEYMAPPING, URL } from "../../constants/variables";
import { useSelector } from "react-redux";
import { getResumeDetails } from "../../redux/slices/root.selector";
import { gravatar } from "../../utils/gravatar";

type Props = Record<string, any>;
const MetaTags: NextPage<Props> = () => {
  const global = useSelector(getResumeDetails)
  const title = get(global, KEYMAPPING.title, "") || "";
  const name = get(global, KEYMAPPING.name, "") || "";
  const description = get(global, KEYMAPPING.description, "") || "";
  const profileImage = gravatar(100);
  const finalTittle = `${name} - ${title}`;
  return (
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <title>{finalTittle}</title>
        <meta name="title" content={finalTittle} />
        <meta name="description" content={description} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={URL} />
        <meta property="og:title" content={finalTittle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={profileImage} />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={URL} />
        <meta property="twitter:title" content={finalTittle} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={profileImage} />
      </Head>
  );
};

export default MetaTags