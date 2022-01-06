import faker from "faker";
import * as Widgets from "./misc/widgets";

import { CustomType, ObjectTabs } from "../models/common/CustomType";
import { Tab } from "@lib/models/common/CustomType/tab";

import { handleFields } from "./misc/handlers";

import { CustomTypeMockConfig } from "@lib/models/common/MockConfig";
import { AsArray, GroupField } from "@lib/models/common/widgets/Group/type";

interface Mock {
  id: string;
  uid: string | null;
  type: string;
  data: { [key: string]: unknown };
}

const fieldsHandler = handleFields(Widgets);

const groupHandler = (
  group: GroupField<AsArray>,
  mockConfig: CustomTypeMockConfig
) => {
  const items = [];
  const entries = group.config.fields.map((e) => [e.key, e.value]);
  for (let i = 0; i < Math.floor(Math.random() * 6) + 2; i++) {
    items.push(fieldsHandler(entries, mockConfig));
  }
  return items;
};

const createEmptyMock = (type: string) => ({
  id: faker.datatype.uuid(),
  uid: null,
  type,
  data: {},
});

export default function MockCustomType(
  model: CustomType<ObjectTabs>,
  mockConfig: CustomTypeMockConfig
): Mock {
  const customTypeMock: Mock = createEmptyMock(model.id);
  const maybeUid = Object.entries(model.tabs).reduce((acc, curr) => {
    const maybeWidgetUid = Object.entries(curr[1]).find(
      ([, e]) => e.type === "UID"
    );
    if (!acc && maybeWidgetUid) {
      return curr;
    }
    return acc;
  });

  if (maybeUid) {
    customTypeMock.uid = Widgets.UID.handleMockConfig();
  }

  for (const [, tab] of Object.entries(model.tabs)) {
    const { fields, groups } = Tab.organiseFields(tab);

    const mockedFields = fieldsHandler(
      fields.map((e) => [e.key, e.value]),
      mockConfig
    );
    customTypeMock.data = {
      ...customTypeMock.data,
      ...mockedFields,
    };
    groups.forEach((group) => {
      const { key, value } = group;
      const groupMockConfig = CustomTypeMockConfig.getFieldMockConfig(
        mockConfig,
        key
      );
      const groupFields = groupHandler(value, groupMockConfig);
      customTypeMock.data[key] = groupFields;
    });
  }
  return customTypeMock;
}
