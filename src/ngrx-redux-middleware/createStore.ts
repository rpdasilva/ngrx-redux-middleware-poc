import { Store } from '@ngrx/store';
import { extractObservableValue, shimStore } from './utils';

export function createStore (store) {
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

      return enhancer(createStore(shimmedStore))(reducer, preloadedState);
    }

    return shimmedStore;
  }
}

export function createStoreFactory (store, enhancer) {
  const reducer = store._reducer.value;
  const preloadedState = store.source.value;
  const enhancedStore = createStore(store)(reducer, preloadedState, enhancer);
  Object.assign(store, enhancedStore);

 return new CreateStore(store, enhancer);
}

export class CreateStore {
  constructor (
    private store,
    private enhancer
  ) {
  }

  private getReducer () {
    return extractObservableValue('_reducer', this.store);
  }

  private getInitialState () {
    return extractObservableValue('source', this.store);
  }

  applyMiddleware (...middleware) {
    const reducer = this.getReducer();
    const preloadedState = this.getInitialState();
    const enhancedStore = createStore(this.store)(reducer, preloadedState, this.enhancer);
    Object.assign(this.store, enhancedStore);
  }
}