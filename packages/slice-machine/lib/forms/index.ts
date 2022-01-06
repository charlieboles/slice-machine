import * as Yup from "yup";
import { FormTypes } from "./types";

type DefaultValReturn = string | number | [] | boolean | undefined;

const handleDefaultValue = (field: {
  type: FormTypes;
  defaultValue: DefaultValReturn;
}): DefaultValReturn => {
  if (field.defaultValue === null) {
    return undefined;
  }
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }
  if (field.type === FormTypes.CHECKBOX) {
    return true;
  }
  if (field.type === FormTypes.INPUT) {
    return "";
  }
  if (field.type === FormTypes.SELECT) {
    return [];
  }
  return undefined;
};

export const createFieldNameFromKey = (key: string): string =>
  key === "id" ? "id" : `config.${key}`;

export const createValidationArgs = (args: unknown, defaultArgs: unknown) => {
  if (Array.isArray(args)) {
    return args;
  }
  if (typeof args === "boolean" && args) {
    return defaultArgs;
  }
  return null;
};

export const createInitialValues = (FormFields: {
  [fieldKey: string]: any;
}) => {
  return Object.entries(FormFields).reduce((acc, [key, val]) => {
    const value = handleDefaultValue(val);
    if (value !== undefined) {
      return {
        ...acc,
        [key]: value,
      };
    }
    return acc;
  }, {});
};

export const createValidationSchema = (FormFields: {
  [fieldKey: string]: any;
}) => {
  return Yup.object()
    .shape(
      Object.entries(FormFields)
        .filter((e) => e)
        .reduce((acc, [key, formField]) => {
          const { validate, yupType } = formField;
          if (!validate) {
            return acc;
          }
          if (typeof validate === "function") {
            return {
              ...acc,
              [key]: validate(key, formField),
            };
          }
          let validator = (Yup as any)[yupType]();
          Object.entries(validate)
            .filter((e) => e && e[1])
            .forEach(([func, args]) => {
              if (args && validator[func]) {
                validator = validator[func](
                  ...(Array.isArray(args) ? args : [args])
                );
                return;
              }
              console.warn(`Invalid Yup validator for field "${key}"`);
            });
          return {
            ...acc,
            [key]: validator,
          };
        }, {})
    )
    .required()
    .default(undefined)
    .noUnknown(true);
};
