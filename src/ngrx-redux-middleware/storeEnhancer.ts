type State = any;
type Action = Object;
type Dispatch = (a: Action) => any
type Reducer<S, A> = (state: S, action: A) => S;
type ReducerSA = Reducer<State, Action>;
type Store = {
  dispatch: Dispatch
  getState: () => State
  subscribe: (listener: () => void) => () => void
  replaceReducer: (reducer: Reducer<State, Action>) => void
}

type StoreEnhancer = (next: StoreCreator) => StoreCreator;
type StoreCreator = (
  reducer: ReducerSA,
  preloadedState?: State,
  enhancer?) => Store;

export function storeEnhancer<StoreEnhancer> (
  createStore: StoreCreator
) {
  return function storeCreator<StoreCreator> (
    reducer: ReducerSA,
    preloadedState: State,
    enhancer?: StoreEnhancer
  ) {
    const store = createStore(reducer, preloadedState, enhancer);
    return store;
  }
}