import { FrontEndEnvironment } from "@lib/models/common/Environment";
import Warning from "@models/common/Warning";
import { ConfigErrors } from "@models/server/ServerState";

export type EnvironmentStoreType = {
  env: FrontEndEnvironment;
  warnings: ReadonlyArray<Warning>;
  configErrors: ConfigErrors;
};
