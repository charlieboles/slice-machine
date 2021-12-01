import type { Models } from "@slicemachine/models";
import * as yup from "yup";
import equal from "fast-deep-equal";

import { Widget } from "../models/common/widgets/Widget";
import { FieldType } from "../models/common/CustomType/fields";
import { DefaultFields } from "../forms/defaults";
import { createInitialValues, createValidationSchema } from "../forms";

export const removeProp = (obj: { [x: string]: unknown }, prop: string) => {
  const { [prop]: __removed, ...rest } = obj;
  return rest;
};

export const ensureDnDDestination = (result: {
  destination?: { droppableId: string; index: number };
  source: { index: number; droppableId: string };
}) => {
  if (!result.destination || result.source.index === result.destination.index) {
    return true;
  }
  if (result.source.droppableId !== result.destination.droppableId) {
    return true;
  }
  return false;
};

export const ensureWidgetTypeExistence = (
  Widgets: { [x: string]: Widget<any, any> },
  type: string
) => {
  const widget: Widget<any, any> = Widgets[type];
  if (!widget) {
    console.log(`Could not find widget with type name "${type}".`);
    return true;
  }
  return false;
};

export const compareVariations = (
  lhs: ReadonlyArray<Models.VariationAsObject | Models.VariationAsArray>,
  rhs: ReadonlyArray<Models.VariationAsObject | Models.VariationAsArray>
) => {
  return equal(
    lhs.map((e) => ({ ...e, imageUrl: undefined })),
    rhs.map((e) => ({ ...e, imageUrl: undefined }))
  );
};
export const createDefaultWidgetValues = (TYPE_NAME: FieldType) => ({
  TYPE_NAME,
  FormFields: DefaultFields,
  schema: yup.object().shape({
    type: yup.string().test({
      name: "type",
      test: function (value) {
        return value === TYPE_NAME;
      },
    }),
    config: createValidationSchema(removeProp(DefaultFields, "id")),
  }),
  create: () => ({
    type: TYPE_NAME,
    config: createInitialValues(removeProp(DefaultFields, "id")),
  }),
});

export const createDefaultHandleMockContentFunction = (
  widget: Widget<any, any>,
  TYPE_NAME: string,
  checkFn: ({}, {}) => boolean
) => {
  return function handleMockContent(mockContent: {}, config: {}) {
    if (!checkFn(mockContent, config)) {
      console.error(
        `Type check for type "${TYPE_NAME}" failed. Using default mock configuration`
      );
      if (widget.handleMockConfig) {
        return widget.handleMockConfig(null, config);
      }
    }
    return mockContent;
  };
};

export const sanitizeSbId = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};
