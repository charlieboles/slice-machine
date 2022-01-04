import Modal from "react-modal";
import SliceMachineModal from "@components/SliceMachineModal";
import { Formik, Form } from "formik";
import { Flex, Heading, Close, Box, Button } from "theme-ui";

import Card from "../Card";

Modal.setAppElement("#__next");

const ModalCard = ({
  children,
  close,
  isOpen,
  formId,
  validate,
  onSubmit,
  widthInPx,
  initialValues = {},
  content: { title },
  cardProps,
  omitFooter,
}: {
  children: any;
  close: () => void;
  isOpen: boolean;
  formId: string;
  validate?: Function;
  widthInPx?: string;
  onSubmit: (v: any) => void;
  initialValues?: any;
  content: { title: string };
  cardProps?: {};
  omitFooter?: boolean;
}) => (
  <SliceMachineModal
    isOpen={isOpen}
    shouldCloseOnOverlayClick
    onRequestClose={() => close()}
    contentLabel={title}
    style={{
      content: {
        width: widthInPx || "900px",
      },
    }}
  >
    <Formik
      validateOnChange
      initialValues={initialValues}
      validate={(values) => (validate ? validate(values) : undefined)}
      onSubmit={(values, _) => {
        onSubmit(values);
        close();
      }}
    >
      {({ isValid, isSubmitting, values, errors, touched, setFieldValue }) => (
        <Form id={formId}>
          <Card
            borderFooter
            footerSx={{ p: 3 }}
            bodySx={{ px: 4, py: 4 }}
            sx={{ border: "none" }}
            {...cardProps}
            Header={({ radius }: { radius: string | number }) => (
              <Flex
                sx={{
                  p: "16px",
                  pl: 4,
                  bg: "headSection",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTopLeftRadius: radius,
                  borderTopRightRadius: radius,
                  borderBottom: (t) => `1px solid ${t.colors?.borders}`,
                }}
              >
                <Heading sx={{ fontSize: "20px" }}>{title}</Heading>
                <Close type="button" onClick={() => close()} />
              </Flex>
            )}
            Footer={
              !omitFooter ? (
                <Flex sx={{ alignItems: "space-between" }}>
                  <Box sx={{ ml: "auto" }} />
                  <Button
                    mr={2}
                    type="button"
                    onClick={() => close()}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    form={formId}
                    type="submit"
                    disabled={!isValid && isSubmitting}
                  >
                    Save
                  </Button>
                </Flex>
              ) : null
            }
          >
            {children({
              isValid,
              isSubmitting,
              values,
              errors,
              touched,
              setFieldValue,
            })}
          </Card>
        </Form>
      )}
    </Formik>
  </SliceMachineModal>
);

export default ModalCard;
