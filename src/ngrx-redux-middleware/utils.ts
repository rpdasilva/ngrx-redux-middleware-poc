import { Action, Store } from '@ngrx/store';

export type State = any;
export type Dispatch = (a: Action) => any
export type Reducer<S, A> = (state: S, action: A) => S;
export type StoreEnhancer = (next: StoreCreator) => StoreCreator;
export type StoreCreator = (
  reducer: Reducer<State, Action>,
  preloadedState?: State,
  // TODO: enhancer type
  enhancer?) => Store<State>;

export function extractObservableValue (prop, obsv$) {
  let value;
  obsv$[prop].take(1).subscribe(v => value = v);
  return value;
}

// TODO: Correctly type store: any
export function shimStore (store: any): Store<State> {
  return Object.assign({}, store, {
    dispatch: store.dispatch.bind(store),
    // TODO: Why does this cause an infinite loop?
    // dispatch: (...args) => store.dispatch(...args),
    getState: () => {
      let state;
      store.source.take(1).subscribe(s => state = s);
      return state;
    },
    subscribe: (...args) => store.source.subscribe(...args)
  });
}

export function _noopEnhancer<StoreEnhancer> (
  createStore: StoreCreator
) {
  return function storeCreator<StoreCreator> (
    reducer: Reducer<State, Action>,
    preloadedState: State,
    enhancer?: StoreEnhancer
  ) {
    const store = createStore(reducer, preloadedState, enhancer);
    return store;
  }
}
