import { useDispatch } from "react-redux";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { modalCloseCreator, modalOpenCreator } from "@src/modules/modal";
import {
  startLoadingActionCreator,
  stopLoadingActionCreator,
} from "@src/modules/loading";
import {
  finishOnboardingCreator,
  sendAReviewCreator,
  skipReviewCreator,
} from "@src/modules/userContext";
import { getEnvironmentCreator } from "@src/modules/environment";
import {
  openSetupPreviewDrawerCreator,
  closeSetupPreviewDrawerCreator,
  toggleSetupDrawerStepCreator,
  checkPreviewSetupCreator,
  connectToPreviewIframeCreator,
} from "@src/modules/preview";
import ServerState from "@models/server/ServerState";

const useSliceMachineActions = () => {
  const dispatch = useDispatch();

  // Preview store
  const checkPreviewSetup = (
    withFirstVisitCheck: boolean,
    callback?: () => void
  ) =>
    dispatch(
      checkPreviewSetupCreator.request({ withFirstVisitCheck, callback })
    );
  const openSetupDrawerDrawer = () =>
    dispatch(openSetupPreviewDrawerCreator({}));
  const connectToPreviewFailure = () =>
    dispatch(connectToPreviewIframeCreator.failure());
  const connectToPreviewSuccess = () =>
    dispatch(connectToPreviewIframeCreator.success());
  const closeSetupDrawerDrawer = () =>
    dispatch(closeSetupPreviewDrawerCreator());
  const toggleSetupDrawerStep = (stepNumber: number) =>
    dispatch(toggleSetupDrawerStepCreator({ stepNumber }));

  // Modal store
  const closeLoginModal = () =>
    dispatch(modalCloseCreator({ modalKey: ModalKeysEnum.LOGIN }));
  const openLoginModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));
  const closeUpdateVersionModal = () =>
    dispatch(modalCloseCreator({ modalKey: ModalKeysEnum.UPDATE_VERSION }));
  const openUpdateVersionModal = () =>
    dispatch(modalOpenCreator({ modalKey: ModalKeysEnum.UPDATE_VERSION }));

  // Loading store
  const startLoadingLogin = () =>
    dispatch(startLoadingActionCreator({ loadingKey: LoadingKeysEnum.LOGIN }));
  const stopLoadingLogin = () =>
    dispatch(stopLoadingActionCreator({ loadingKey: LoadingKeysEnum.LOGIN }));

  // UserContext Store
  const skipReview = () => dispatch(skipReviewCreator());
  const sendAReview = (rating: number, comment: string) =>
    dispatch(
      sendAReviewCreator.request({
        rating,
        comment,
      })
    );
  const finishOnboarding = () => dispatch(finishOnboardingCreator());
  const getEnvironment = (serverState: ServerState | undefined) => {
    if (!serverState) return;

    dispatch(
      getEnvironmentCreator({
        env: serverState.env,
        warnings: serverState.warnings,
        configErrors: serverState.configErrors,
      })
    );
  };

  return {
    checkPreviewSetup,
    connectToPreviewFailure,
    connectToPreviewSuccess,
    toggleSetupDrawerStep,
    closeSetupDrawerDrawer,
    openSetupDrawerDrawer,
    getEnvironment,
    finishOnboarding,
    openLoginModal,
    closeLoginModal,
    startLoadingLogin,
    stopLoadingLogin,
    sendAReview,
    skipReview,
    closeUpdateVersionModal,
    openUpdateVersionModal,
  };
};

export default useSliceMachineActions;
