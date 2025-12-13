import type { NextPage } from "next";
import dynamic from "next/dynamic";
import MetaTags from "../components/MetaTags";
import { Provider } from "react-redux";
import store from "../redux/store";

const DynamicHomePage = dynamic(() => import("../components/Homepage"), {
  ssr: false,
});
type Props = Record<string, any>;
const Home: NextPage<Props> = ({ global = {} }) => {
  return (
    <div>
      <main>
        <Provider store={store}>
          <MetaTags />
          <DynamicHomePage />
        </Provider>
      </main>
    </div>
  );
};

export default Home;
