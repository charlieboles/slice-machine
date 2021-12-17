import { Reducer } from "redux";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  ActionType,
  createAction,
  createAsyncAction,
  getType,
} from "typesafe-actions";
import { UserContextStoreType } from "@src/modules/userContext/types";
import { withLoader } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { sendTrackingReview } from "@src/apiClient";
import { modalOpenCreator } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { fork, takeLatest, put, call } from "redux-saga/effects";

// NOTE: Be careful every key written in this store is persisted in the localstorage

const initialState: UserContextStoreType = {
  hasSendAReview: false,
  isOnboarded: false,
};

// Actions Creators
export const sendAReviewCreator = createAsyncAction(
  "USER_CONTEXT/SEND_REVIEW.REQUEST",
  "USER_CONTEXT/SEND_REVIEW.SUCCESS",
  "USER_CONTEXT/SEND_REVIEW.FAILURE"
)<
  {
    rating: number;
    comment: string;
  },
  undefined,
  undefined
>();

export const skipReviewCreator = createAction("USER_CONTEXT/SKIP_REVIEW")();

export const finishOnboardingCreator = createAction(
  "USER_CONTEXT/FINISH_ONBOARDING"
)();

type userContextActions = ActionType<
  | typeof finishOnboardingCreator
  | typeof sendAReviewCreator.success
  | typeof skipReviewCreator
>;

// Selectors
export const userHasSendAReview = (state: SliceMachineStoreType): boolean =>
  state.userContext.hasSendAReview;

export const userHasDoneTheOnboarding = (
  state: SliceMachineStoreType
): boolean => state.userContext.isOnboarded;

// Reducer
export const userContextReducer: Reducer<
  UserContextStoreType,
  userContextActions
> = (state = initialState, action) => {
  switch (action.type) {
    case getType(sendAReviewCreator.success):
    case getType(skipReviewCreator):
      return {
        ...state,
        hasSendAReview: true,
      };
    case getType(finishOnboardingCreator):
      return {
        ...state,
        isOnboarded: true,
      };
    default:
      return state;
  }
};

// Sagas
function* sendReviewSaga(
  action: ReturnType<typeof sendAReviewCreator.request>
) {
  try {
    yield call(
      sendTrackingReview,
      action.payload.rating,
      action.payload.comment
    );
    yield put(sendAReviewCreator.success());
  } catch (error) {
    if (403 === error.response?.status) {
      yield put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));
    }
    if (401 === error.response?.status) {
      addToast("You don't have access to the repo", { appearance: "error" });
    }
  }
}

// Saga watchers
function* watchSendReviewSetup() {
  yield takeLatest(
    getType(sendAReviewCreator.request),
    withLoader(sendReviewSaga, LoadingKeysEnum.REVIEW)
  );
}

// Saga Exports
export function* watchUserContextSagas() {
  yield fork(watchSendReviewSetup);
}
