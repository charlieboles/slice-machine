import type { Models } from "@slicemachine/models";
import { Variation } from "../../../lib/models/common/Variation";
import equal from "fast-deep-equal";
import SliceState from "../../../lib/models/ui/SliceState";

import { Field, FieldType } from "../../../lib/models/common/CustomType/fields";
import { sliceZoneType } from "../../../lib/models/common/CustomType/sliceZone";
import { AnyWidget } from "../../../lib/models/common/widgets/Widget";
import * as Widgets from "../../../lib/models/common/widgets";

import { ActionType as VariationActions } from "./variation/actions";

import { ActionType as SliceActions } from "./actions";

import {
  LibStatus,
  ScreenshotUI,
} from "../../../lib/models/common/ComponentUI";
import { compareVariations } from "../../../lib/utils";

export function reducer(
  prevState: SliceState,
  action: { type: string; payload?: unknown }
): SliceState {
  const result = ((): SliceState => {
    switch (action.type) {
      case SliceActions.Reset:
        return {
          ...prevState,
          variations: prevState.initialVariations,
        };
      case SliceActions.Save: {
        const { state } = action.payload as { state: SliceState };
        return state;
      }
      case SliceActions.Push:
        return {
          ...prevState,
          initialScreenshotUrls: prevState.screenshotUrls,
          remoteVariations: prevState.variations,
        };
      case SliceActions.UpdateMetadata:
        return {
          ...prevState,
          infos: {
            ...prevState.infos,
            ...(action.payload as Models.ComponentMetadata),
          },
        };
      case SliceActions.CopyVariation: {
        const { key, name, copied } = action.payload as {
          key: string;
          name: string;
          copied: Models.VariationAsArray;
        };
        return {
          ...prevState,
          variations: prevState.variations.concat([
            Variation.copyValue<Models.VariationAsArray>(copied, key, name),
          ]),
        };
      }
      case VariationActions.GenerateCustomScreenShot: {
        const { variationId, preview } = action.payload as {
          variationId: string;
          preview: ScreenshotUI;
        };

        const screenshots = prevState.variations.reduce((acc, variation) => {
          if (variation.id === variationId) {
            return {
              ...acc,
              [variationId]: preview,
            };
          }
          if (prevState.screenshotUrls?.[variation.id]) {
            return {
              ...acc,
              [variation.id]: prevState.screenshotUrls?.[variation.id],
            };
          }
          return acc;
        }, {});

        return {
          ...prevState,
          screenshotUrls: screenshots,
          infos: prevState.infos,
        };
      }
      case VariationActions.GenerateScreenShot: {
        const { previews } = action.payload as {
          variationId: string;
          previews: Record<string, Models.Screenshot>;
        };
        return {
          ...prevState,
          infos: {
            ...prevState.infos,
            screenshotPaths: {
              ...prevState.infos.screenshotPaths,
              ...previews,
            },
          },
        };
      }
      case VariationActions.AddWidget: {
        const { variationId, widgetsArea, key, value } = action.payload as {
          variationId: string;
          widgetsArea: Models.WidgetsArea;
          key: string;
          value: Field;
        };
        try {
          if (value.type !== sliceZoneType && value.type !== FieldType.Group) {
            const CurrentWidget: AnyWidget = Widgets[value.type];
            CurrentWidget.schema.validateSync(value, { stripUnknown: false });
            return SliceState.updateVariation(
              prevState,
              variationId
            )((v) => Variation.addWidget(v, widgetsArea, key, value));
          }
          return prevState;
        } catch (err) {
          console.error(
            `[store/addWidget] Model is invalid for widget "${value.type}".\nFull error: ${err}`
          );
          return prevState;
        }
      }
      case VariationActions.ReplaceWidget: {
        const { variationId, widgetsArea, previousKey, newKey, value } =
          action.payload as {
            variationId: string;
            widgetsArea: Models.WidgetsArea;
            previousKey: string;
            newKey: string;
            value: Field;
          };
        try {
          if (value.type !== sliceZoneType && value.type !== FieldType.Group) {
            const CurrentWidget: AnyWidget = Widgets[value.type];
            CurrentWidget.schema.validateSync(value, { stripUnknown: false });
            return SliceState.updateVariation(
              prevState,
              variationId
            )((v) =>
              Variation.replaceWidget(
                v,
                widgetsArea,
                previousKey,
                newKey,
                value
              )
            );
          }
          return prevState;
        } catch (err) {
          console.error(
            `[store/replaceWidget] Model is invalid for widget "${value.type}".\nFull error: ${err}`
          );
          return prevState;
        }
      }
      case VariationActions.ReorderWidget: {
        const { variationId, widgetsArea, start, end } = action.payload as {
          variationId: string;
          widgetsArea: Models.WidgetsArea;
          start: number;
          end: number;
        };
        return SliceState.updateVariation(
          prevState,
          variationId
        )((v) => Variation.reorderWidget(v, widgetsArea, start, end));
      }
      case VariationActions.RemoveWidget: {
        const { variationId, widgetsArea, key } = action.payload as {
          variationId: string;
          widgetsArea: Models.WidgetsArea;
          key: string;
        };
        return SliceState.updateVariation(
          prevState,
          variationId
        )((v) => Variation.deleteWidget(v, widgetsArea, key));
      }
      case VariationActions.UpdateWidgetMockConfig:
        return {
          ...prevState,
          mockConfig: action.payload as any,
        };

      case VariationActions.DeleteWidgetMockConfig:
        return {
          ...prevState,
          mockConfig: action.payload as any,
        };

      default:
        throw new Error("Invalid action.");
    }
  })();
  return {
    ...result,
    isTouched: (() => {
      return (
        !equal(result.initialVariations, result.variations) ||
        !equal(result.initialMockConfig, result.mockConfig)
      );
    })(),
    __status: (() => {
      return !equal(result.screenshotUrls, result.initialScreenshotUrls) ||
        !compareVariations(result.remoteVariations, result.initialVariations)
        ? LibStatus.Modified
        : LibStatus.Synced;
    })(),
  };
}
