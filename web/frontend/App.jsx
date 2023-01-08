import { BrowserRouter } from "react-router-dom";
import { NavigationMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";

import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
} from "./components";

import {
  AppType,
  Provider as GadgetProvider,
  useGadget,
} from "@gadgetinc/react-shopify-app-bridge";
import { api } from "./api";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");

  return (
    <GadgetProvider
      type={AppType.Embedded}
      shopifyApiKey={process.env["NEXT_PUBLIC_SHOPIFY_API_KEY"]}
      api={api}
    >
      <PolarisProvider>
        <QueryProvider>
          <EmbeddedApp />
        </QueryProvider>
      </PolarisProvider>
    </GadgetProvider>
  );
}

function EmbeddedApp() {
  // we use `isAuthenticated` to render pages once the OAuth flow is complete!
  const { isAuthenticated } = useGadget();

  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");

  return !isAuthenticated ? (
    <span>Loading...</span>
  ) : (
    <>
      <NavigationMenu
        navigationLinks={[
          {
            label: "Page name",
            destination: "/pagename",
          },
        ]}
      />
      <Routes pages={pages} />
    </>
  );
}
