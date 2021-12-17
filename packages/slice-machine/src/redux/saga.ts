import { fork } from "redux-saga/effects";

import { watchPreviewSagas } from "@src/modules/preview";
import { watchUserContextSagas } from "@src/modules/userContext";

// Single entry point to start all Sagas at once
export default function* rootSaga() {
  yield fork(watchPreviewSagas);
  yield fork(watchUserContextSagas);
}
