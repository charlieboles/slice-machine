import { createStore, compose } from "redux";
import createReducer from "./reducer";

declare var window: {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
};

export default function configureStore() {
  const composeEnhancers =
    process.env.NODE_ENV !== "production" &&
    typeof window === "object" &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;

  const rootReducer = createReducer();

  const store: any = createStore(rootReducer, {}, composeEnhancers());

  store.asyncReducers = {};

  return { store };
}