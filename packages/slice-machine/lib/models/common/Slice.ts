import type Models from "@slicemachine/core/build/src/models";
import { SliceMockConfig } from "./MockConfig";
import { Screenshots } from "./Screenshots";
import { Variation } from "./Variation";

const Slice = {
  toObject(slice: Models.SliceAsArray): Models.SliceAsObject {
    return {
      ...slice,
      variations: slice.variations.map(Variation.toObject),
    };
  },

  toArray(slice: Models.SliceAsObject): Models.SliceAsArray {
    return {
      ...slice,
      variations: slice.variations.map(Variation.toArray),
    };
  },
};

export interface SliceSaveBody {
  sliceName: string;
  from: string;
  model: Models.SliceAsObject;
  mockConfig?: SliceMockConfig;
}

export interface SliceSaveResponse {
  screenshots: Screenshots;
  warning: string | null;
}

export default Slice;
