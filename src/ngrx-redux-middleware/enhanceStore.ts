import { compose } from '@ngrx/core';
import { Action, Store } from '@ngrx/store';
import {
  extractObservableValue,
  shimStore,
  Reducer,
  State,
  StoreEnhancer
} from './utils';

// TODO: Determine if composeWithDevTools can be supported
export function enhanceStore (store: Store<State>) {
  const shimmedStore = shimStore(store);

  return function (reducer, preloadedState, enhancer?) {
    if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
      enhancer = preloadedState;
      preloadedState = undefined;
    }

    if (typeof enhancer !== 'undefined') {
      if (typeof enhancer !== 'function') {
        throw new Error('Expected the enhancer to be a function.');
      }

      return enhancer(enhanceStore(shimmedStore))(reducer, preloadedState);
    }

    return shimmedStore;
  }
}

export function ngrxReduxStoreFactory (
  store: Store<State>,
  enhancer: StoreEnhancer
) {
 return new NgrxReduxStore(store, enhancer);
}

export class NgrxReduxStore {
  private _enhanced = false;

  constructor (
    private store: Store<State>,
    private enhancer?: StoreEnhancer
  ) {
    if (enhancer) {
      this.enhanceStore(enhancer);
    }
  }

  private getReducer (): Reducer<State, Action> {
    return extractObservableValue('_reducer', this.store);
  }

  private getInitialState (): State {
    return extractObservableValue('source', this.store);
  }

  enhanceStore (enhancer): void {
    const reducer = this.getReducer();
    const preloadedState = this.getInitialState();
    const enhancedStore = enhanceStore(this.store)(reducer, preloadedState, enhancer);

    Object.assign(this.store, enhancedStore);
    this._enhanced = true;
  }
}
