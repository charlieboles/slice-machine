import { Library } from "@models/common/Library";
import Environment from "@models/common/Environment";
import Slice from "@models/common/Slice";
import { AsObject } from "@models/common/Variation";

export type LibraryProps = {
  libraries: ReadonlyArray<Library>;
};
