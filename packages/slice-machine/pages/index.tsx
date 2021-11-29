import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState, Fragment } from "react";
import {
  Box,
  Flex,
  Button,
  Text,
  Card as ThemeCard,
  Link as ThemeLink,
  Heading,
} from "theme-ui";
import { FiLayout } from "react-icons/fi";

import { GoPlus } from "react-icons/go";

import Container from "@components/Container";

import Grid from "@components/Grid";

import CreateCustomTypeModal from "@components/Forms/CreateCustomTypeModal";

import Header from "@components/Header";
import EmptyState from "@components/EmptyState";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useSelector } from "react-redux";
import { getLocalCustomTypes } from "@src/modules/customTypes";

interface CtPayload {
  repeatable: boolean;
  id: string;
  previewUrl: string;
  label: string;
}

// To isolate later
const CTName: React.FunctionComponent<{ ctName: string }> = ({ ctName }) => {
  return (
    <Heading sx={{ flex: 1, lineHeight: 20 }} as="h6">
      {ctName}
    </Heading>
  );
};

// To isolate later
const CTRepeatble: React.FunctionComponent<{ repeatable: boolean }> = ({
  repeatable,
}) => {
  return (
    <Text sx={{ fontSize: 0, color: "textClear", lineHeight: "20px" }}>
      {repeatable ? "Repeatable" : "Single"} Type
    </Text>
  );
};

// To isolate later
const CTThumbnail = ({
  heightInPx,
  preview = null,
  withShadow = true,
}: {
  heightInPx: string;
  preview: { url: string } | null;
  withShadow?: boolean;
}) => {
  return (
    <Box
      sx={{
        backgroundColor: "headSection",
        backgroundRepeat: "repeat",
        backgroundSize: "15px",
        backgroundImage: "url(/pattern.png)",
        height: heightInPx,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "6px",
        border: (t) => `1px solid ${t.colors?.borders}`,
        boxShadow: withShadow ? "0px 8px 14px rgba(0, 0, 0, 0.1)" : "none",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          backgroundSize: "contain",
          backgroundPosition: "50%",
          backgroundRepeat: "no-repeat",
          backgroundImage: "url(" + `${preview?.url}` + ")",
        }}
      />
    </Box>
  );
};
// To isolate later
const Card: React.FunctionComponent<{ ct: CtPayload }> = ({ ct }) => (
  <Link href={`/cts/${ct.id}`} passHref>
    <ThemeLink variant="links.invisible">
      <ThemeCard
        role="button"
        aria-pressed="false"
        sx={{
          bg: "transparent",
          border: "none",
          transition: "all 100ms cubic-bezier(0.215,0.60,0.355,1)",
        }}
      >
        <CTThumbnail preview={{ url: ct.previewUrl }} heightInPx="287px" />
        <Flex
          mt={3}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <CTName ctName={ct.label} />
          <CTRepeatble repeatable={ct.repeatable} />
        </Flex>
      </ThemeCard>
    </ThemeLink>
  </Link>
);

const CustomTypes: React.FunctionComponent = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { createCustomType } = useSliceMachineActions();
  const customTypes = useSelector(getLocalCustomTypes);

  const _onCreate = ({ id, label, repeatable }: CtPayload): void => {
    createCustomType(id, label, repeatable);
    setIsOpen(false);
    router.push(`/cts/${id}`);
  };

  return (
    <Container sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Header
        ActionButton={
          <Button
            onClick={() => setIsOpen(true)}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "50%",
              height: "48px",
              width: "48px",
            }}
          >
            <GoPlus size={"2em"} />
          </Button>
        }
        MainBreadcrumb={
          <Fragment>
            <FiLayout /> <Text ml={2}>Custom Types</Text>
          </Fragment>
        }
        breadrumbHref="/"
      />
      {!customTypes.length ? (
        <EmptyState
          title={"Create your first Custom Type"}
          explanations={[
            "Click the + button on the top right to create your first custom type.",
            "It will be stored locally. You will then be able to push it to Prismic.",
          ]}
          onCreateNew={() => setIsOpen(true)}
          buttonText={"Create your first Custom Type"}
          documentationComponent={
            <>
              Go to our{" "}
              <ThemeLink
                target={"_blank"}
                href={"https://prismic.io/docs/core-concepts/custom-types "}
                sx={(theme) => ({ color: theme?.colors?.primary })}
              >
                documentation
              </ThemeLink>{" "}
              to learn more about Custom Types.
            </>
          }
        />
      ) : (
        <Grid
          elems={customTypes}
          renderElem={(ct: CtPayload) => (
            <Link passHref href={`/cts/${ct.id}`} key={ct.id}>
              <Card ct={ct} />
            </Link>
          )}
        />
      )}
      <CreateCustomTypeModal
        isOpen={isOpen}
        onSubmit={_onCreate}
        customTypes={customTypes}
        close={() => setIsOpen(false)}
      />
    </Container>
  );
};

export default CustomTypes;
