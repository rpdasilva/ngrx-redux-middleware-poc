import { Inject, NgModule, OpaqueToken } from '@angular/core';
import { Store, StoreModule } from '@ngrx/store';
import { compose as _compose } from 'redux';
import 'rxjs/add/operator/take';

export const APPLY_MIDDLEWARE = new OpaqueToken('@@ngrx-redux-middleware/applyMiddleware');
export const MIDDLEWARES = new OpaqueToken('@@ngrx-redux-middleware/middlewares');
export const CREATE_STORE = new OpaqueToken('@@ngrx-redux-middleware/createStore');
export const ENHANCER = new OpaqueToken('@@ngrx-redux-middleware/enhancer');

type RetypedCompose = (...funcs: Function[]) => Function;
const compose = _compose as RetypedCompose;

export function shimStore (store) {
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

export function createStoreFactory (store: Store<any>, enhancer) {
  const reducer = store['_reducer'].value;
  const preloadedState = store['source']['value'];
  const enhancedStore = createStore(store)(reducer, preloadedState, enhancer);
  Object.assign(store, enhancedStore);
}

// TODO: Determine if composeWithDevTools can be supported
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

// TODO: Figure out why thunk actions aren't logged
// (enhanceStore behaves as expected)
export function applyMiddlewareFactory(store: Store<any>, middlewares: any[]) {
  const shimmedStore = shimStore(store);
  const chain = middlewares.map(middleware => middleware(shimmedStore));

  Object.assign(store, shimmedStore, {
    dispatch: compose(...chain)(shimmedStore.dispatch)
  });
}

@NgModule({
  providers: [
    {
    provide: APPLY_MIDDLEWARE,
    useFactory: applyMiddlewareFactory,
    deps: [ Store, MIDDLEWARES ]
  },
  {
    provide: CREATE_STORE,
    useFactory: createStoreFactory,
    deps: [ Store, ENHANCER ]
  }]
})
export class NgrxReduxMiddlewareModule {
  static applyMiddleware (middlewares: any[] = []) {
    return {
      ngModule: NgrxReduxMiddlewareModule,
      providers: [
        { provide: MIDDLEWARES, useValue: middlewares }
      ]
    };
  }

  static enhanceStore (enhancer: any) {
    return {
      ngModule: NgrxReduxMiddlewareModule,
      providers: [
        { provide: ENHANCER, useValue: enhancer }
      ]
    };
  }

  constructor(
    // @Inject(APPLY_MIDDLEWARE) applyMiddleware,
    @Inject(CREATE_STORE) createStore
  ) { }
}
