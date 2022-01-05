import { fetchApi } from "@lib/builders/common/fetch";

import { CustomType } from "@lib/models/common/CustomType";
import { CustomTypeState } from "@models/ui/CustomTypeState";
import ActionType from "./";
import { ToastPayload } from "@src/ToastProvider/utils";

export default function save(
  dispatch: ({ type, payload }: { type: string; payload?: any }) => void
) {
  return (
    customType: CustomTypeState,
    setData?: (data: ToastPayload) => void
  ): void => {
    fetchApi({
      url: "/api/custom-types/save",
      params: {
        method: "POST",
        body: JSON.stringify({
          ...customType,
          model: CustomType.toObject(customType.current),
          mockConfig: customType.mockConfig,
        }),
      },
      setData:
        setData ||
        function () {
          return {};
        },
      successMessage: "Model & mocks have been generated successfully!",
      onSuccess() {
        dispatch({ type: ActionType.Save, payload: { state: customType } });
      },
    }).catch((err) => {
      console.warn(err);
    });
  };
}
