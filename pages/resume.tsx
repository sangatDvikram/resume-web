import type { NextPage } from "next";
import App from "../app";
import { fetchAPILocal } from "../lib/api";
import { GlobalContext } from "../constants/context";
import MetaTags from "../components/MetaTags";
import { Provider } from "react-redux";
import store from "../redux/store";

type Props = Record<string, any>;
const Resume: NextPage<Props> = ({ global = {} }) => {
  return (
    <div>
      <main>
        <Provider store={store}>
          <GlobalContext.Provider value={global}>
            <MetaTags />
            <App />
          </GlobalContext.Provider>
        </Provider>
      </main>
    </div>
  );
};

export default Resume;
export async function getStaticProps() {
  const global = await fetchAPILocal();
  return {
    props: {
      global: JSON.parse(global),
    }, // will be passed to the page component as props
  };
}
