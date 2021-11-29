import * as yup from "yup";
import Select from "react-select";
import { Label, Box } from "theme-ui";

import { DefaultFields } from "@lib/forms/defaults";

import WidgetFormField from "@lib/builders/common/EditModal/Field";

import { Col, Flex as FlexGrid } from "components/Flex";
import { createFieldNameFromKey } from "@lib/forms";
import { useSelector } from "react-redux";
import { getLocalCustomTypes } from "@src/modules/customTypes";

const FormFields = {
  label: DefaultFields.label,
  id: DefaultFields.id,
  customtypes: {
    validate: () => yup.array().of(yup.string()),
  },
};

const WidgetForm = ({
  initialValues,
  values: formValues,
  fields,
  setFieldValue,
}) => {
  const localCustomTypes = useSelector(getLocalCustomTypes);

  const options = localCustomTypes.map((ct) => ({
    value: ct?.id,
    label: ct?.label,
  }));

  const selectValues = formValues.config.customtypes.map((id) => {
    const ct = localCustomTypes.find((e) => e && e.id === id);
    return { value: ct?.id, label: ct?.label };
  });

  return (
    <FlexGrid>
      {Object.entries(FormFields)
        .filter((e) => e[0] !== "customtypes")
        .map(([key, field]) => (
          <Col key={key}>
            <WidgetFormField
              fieldName={createFieldNameFromKey(key)}
              formField={field}
              fields={fields}
              initialValues={initialValues}
            />
          </Col>
        ))}
      <Col>
        <Box
          sx={{
            mt: 2,
            alignItems: "center",
          }}
        >
          <Label htmlFor="origin" mb="1">
            Custom Types
          </Label>
          <Select
            isMulti
            name="origin"
            options={options}
            onChange={(v) => {
              if (v) {
                setFieldValue(
                  "config.customtypes",
                  v.map(({ value }) => value)
                );
              }
            }}
            value={selectValues}
            theme={(theme) => {
              return {
                ...theme,
                colors: {
                  ...theme.colors,
                  text: "text",
                  primary: "background",
                },
              };
            }}
          />
        </Box>
      </Col>
    </FlexGrid>
  );
};

export { FormFields };

export default WidgetForm;
