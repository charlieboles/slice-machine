import { DragDropContext, Droppable } from "react-beautiful-dnd";

import { Box, Text } from "theme-ui";

import ListItem from "components/ListItem";

import Hint from "./components/Hints";

import { findWidgetByConfigOrType } from "../../../utils";

import * as Widgets from "@lib/models/common/widgets/withGroup";

import Li from "components/Li";
import { useSelector } from "react-redux";
import { getEnvironment } from "@src/modules/environment";

const FieldZone = ({
  fields,
  store,
  Model,
  title,
  tabId,
  enterEditMode,
  enterSelectMode,
  onDragEnd,
  renderFieldAccessor,
  onDeleteItem,
  showHints,
  NewFieldC,
  renderHintBase,
  isRepeatable,
}) => {
  const {
    env: { framework },
  } = useSelector((store) => ({
    env: getEnvironment(store),
  }));

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={title}>
        {(provided, snapshot) => (
          <Box
            as="ul"
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ ...provided.droppableProps.style, padding: "4px 0" }}
          >
            {fields.map((item, index) => {
              const {
                value: { config, type },
              } = item;
              const widget = findWidgetByConfigOrType(Widgets, config, type);
              if (!widget) {
                return (
                  <Li>
                    <Text>Field type "{type}" not supported</Text>
                  </Li>
                );
              }

              const props = {
                item,
                index,
                store,
                Model,
                tabId,
                widget,
                showHints,
                key: item.key,
                enterSelectMode,
                renderFieldAccessor,
                enterEditMode,
                parentSnapshot: snapshot,
                deleteItem: onDeleteItem,
                draggableId: `list-item-${item.key}`,
              };

              if (widget.CustomListItem) {
                const { CustomListItem } = widget;
                return <CustomListItem {...props} framework={framework} />;
              }

              const HintElement = (
                <Hint
                  item={item}
                  show={showHints}
                  isRepeatable={isRepeatable}
                  renderHintBase={renderHintBase}
                  framework={framework}
                  Widgets={Widgets}
                  typeName={widget.CUSTOM_NAME || widget.TYPE_NAME}
                />
              );
              return <ListItem {...props} HintElement={HintElement} />;
            })}
            {provided.placeholder}
            <NewFieldC />
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default FieldZone;
