import type { Analytics as ClientAnalytics } from "@segment/analytics-next";
import { AnalyticsBrowser } from "@segment/analytics-next";

// These events should be sync with the tracking Plan on segment.

type AllSliceMachineEventType = EventType | ContinueOnboardingType;

enum EventType {
  Review = "SliceMachine Review",
  OnboardingStart = "SliceMachine Onboarding Start",
  OnboardingSkip = "SliceMachine Onboarding Skip",
}

export enum ContinueOnboardingType {
  OnboardingContinueIntro = "SliceMachine Onboarding Continue Screen Intro",
  OnboardingContinueScreen1 = "SliceMachine Onboarding Continue Screen 1",
  OnboardingContinueScreen2 = "SliceMachine Onboarding Continue Screen 2",
  OnboardingContinueScreen3 = "SliceMachine Onboarding Continue Screen 3",
}

let _client: ClientAnalytics | null = null;

// Track event method
const _trackEvent = (
  eventType: AllSliceMachineEventType,
  attributes: Record<string, unknown> = {}
): void => {
  if (!_client) {
    console.warn(`Couldn't report event ${eventType}`);
    return;
  }

  _client
    .track(eventType, attributes)
    .catch(() => console.warn(`Couldn't report event ${eventType}`));
};

const initialize = async (segmentKey: string): Promise<void> => {
  try {
    // We avoid rewriting a new client if we have already one
    if (!!_client) return;
    _client = await AnalyticsBrowser.standalone(segmentKey);
  } catch (error) {
    console.warn(error);
  }
};

const trackReview = (framework: string, rating: number, comment: string) => {
  _trackEvent(EventType.Review, { rating, comment, framework });
};

const trackOnboardingStart = () => {
  _trackEvent(EventType.OnboardingStart);
};

const trackOnboardingContinue = (
  continueOnboardingEventType: ContinueOnboardingType,
  onboardingVideoCompleted?: boolean
) => {
  _trackEvent(continueOnboardingEventType, { onboardingVideoCompleted });
};

const trackOnboardingSkip = (
  screenSkipped: number,
  onboardingVideoCompleted?: boolean
) => {
  _trackEvent(EventType.OnboardingSkip, {
    screenSkipped,
    onboardingVideoCompleted,
  });
};

export default {
  initialize,
  trackReview,
  trackOnboardingSkip,
  trackOnboardingStart,
  trackOnboardingContinue,
};
