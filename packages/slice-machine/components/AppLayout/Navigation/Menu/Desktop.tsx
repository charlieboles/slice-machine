import { Box, Divider } from "theme-ui";
import { useContext } from "react";
import { FiZap } from "react-icons/fi";
import VersionBadge from "components/AppLayout/Navigation/Badge";
import ItemsList from "./Navigation/List";
import Logo from "components/AppLayout/Navigation/Menu/Logo";
import { NavCtx } from "..";
import Item from "./Navigation/Item";

const warnings = {
  title: "Warnings",
  delimiter: true,
  href: "/warnings",
  match(pathname: string) {
    return pathname.indexOf('/warnings') === 0
  },
  Icon: FiZap,
};

const Desktop = () => {
  const navCtx = useContext(NavCtx)


  console.log({ navCtx })
  return (
    <Box as="aside" bg="sidebar" sx={{ minWidth: "260px" }}>
      <Box py={4} px={3}>
        <Logo />
        <ItemsList mt={4} links={navCtx?.links as []} />
        <Box sx={{ position: "absolute", bottom: "3" }}>
          <Divider variant="sidebar" />
          <Item link={warnings} />
          <VersionBadge
            label="Version"
            version={navCtx?.env?.currentVersion as string}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Desktop;
