import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import configureStore from "src/redux/store";
import useSwr from "swr";
import App, { AppContext } from "next/app";
import { PersistGate } from "redux-persist/integration/react";

import theme from "src/theme";

import LoadingPage from "components/LoadingPage";
import SliceMachineApp from "components/App";

import "react-tabs/style/react-tabs.css";
import "rc-drawer/assets/index.css";
import "react-datepicker/dist/react-datepicker.css";
import "src/css/modal.css";
import "src/css/tabs.css";
import "src/css/drawer.css";

import "highlight.js/styles/atom-one-dark.css";

import ServerState from "lib/models/server/ServerState";
import { LibraryUI } from "lib/models/common/LibraryUI";

import Head from "next/head";
import { AppInitialProps } from "next/dist/shared/lib/utils";

async function fetcher(url: string): Promise<any> {
  return fetch(url).then((res) => res.json());
}

function mapSlices(libraries: ReadonlyArray<LibraryUI> | null) {
  return (libraries || []).reduce((acc, lib) => {
    return {
      ...acc,
      ...lib.components.reduce(
        (acc, comp) => ({
          ...acc,
          [`${comp.from}:${comp.infos.sliceName}`]: 1,
        }),
        {}
      ),
    };
  }, {});
}

function MyApp({ Component, pageProps }: AppContext & AppInitialProps) {
  const { data: serverState }: { data?: ServerState } = useSwr(
    "/api/state",
    fetcher
  );

  // Technical Debt : This internal state is used for forcing React to reload all the app,
  // to remove it we should change how the slice store is handled
  const [sliceMap, setSliceMap] = useState<any | null>(null);

  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!serverState) {
      return;
    }
    const newSliceMap = mapSlices(serverState.libraries);
    if (sliceMap !== null) {
      Object.keys(newSliceMap).forEach((key) => {
        if (!sliceMap[key]) {
          return (window.location.href = `/slices`);
        }
      });
    }
    setSliceMap(newSliceMap);
    setIsLoadingData(false);
    const { env, configErrors, warnings, libraries } = serverState;
    console.log("------ SliceMachine log ------");
    console.log("Loaded libraries: ", { libraries });
    console.log("Loaded env: ", { env, configErrors });
    console.log("Warnings: ", { warnings });
    console.log("------ End of log ------");
  }, [serverState]);

  console.log({ serverState });
  if (!serverState)
    return (
      <>
        <Head>
          <title>SliceMachine</title>
        </Head>
        <LoadingPage />
      </>
    );
  const { store, persistor } = configureStore({
    environment: { env: serverState.env, warnings: [], configErrors: {} },
  });

  return (
    <>
      <Head>
        <title>SliceMachine</title>
        <script type="text/javascript" src="/segment-script.js" />
      </Head>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SliceMachineApp theme={theme} serverState={serverState}>
            {isLoadingData ? <LoadingPage /> : <Component {...pageProps} />}
          </SliceMachineApp>
        </PersistGate>
      </Provider>
    </>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  return await App.getInitialProps(appContext);
};

export default MyApp;
