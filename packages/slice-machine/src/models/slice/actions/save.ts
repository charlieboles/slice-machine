import { Variation } from "../../../../lib/models/common/Variation";
import { fetchApi } from "../../../../lib/builders/common/fetch";
import SliceState from "../../../../lib/models/ui/SliceState";
import { ActionType } from "./ActionType";
import { ToastPayload } from "../../../../src/ToastProvider/utils";
import { SliceSaveResponse } from "@lib/models/common/Slice";

export default function save(
  dispatch: ({ type, payload }: { type: string; payload?: any }) => void
) {
  return (slice: SliceState, setData?: (data: ToastPayload) => void): void => {
    fetchApi({
      url: "/api/slices/save",
      params: {
        method: "POST",
        body: JSON.stringify({
          sliceName: slice.infos.sliceName,
          from: slice.from,
          model: {
            ...slice.model,
            variations: slice.variations.map(Variation.toObject),
          },
          mockConfig: slice.mockConfig,
        }),
      },
      setData:
        setData ||
        function () {
          return {};
        },
      successMessage: "Model & mocks have been generated successfully!",
      onSuccess({ screenshots }: SliceSaveResponse) {
        const savedState = {
          ...slice,
          screenshotUrls: screenshots,
          initialMockConfig: slice.mockConfig,
          initialVariations: slice.variations,
        };
        dispatch({ type: ActionType.Save, payload: { state: savedState } });
      },
    }).catch((err) => {
      console.warn(err);
    });
  };
}
