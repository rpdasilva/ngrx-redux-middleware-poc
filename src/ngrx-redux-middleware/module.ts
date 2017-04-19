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

export function mutateStore (store) {
  return Object.assign(store, {
    dispatch: store.dispatch.bind(store),
    getState: () => {
      let state;
      store.take(1).subscribe(s => state = s);
      return state;
    }
  });
}

export function createStoreFactory (store: Store<any>, enhancer) {
  const reducer = () => {};
  const preloadedState = {};
  const enhancedStore = createStore(store)(reducer, preloadedState, enhancer);
  Object.assign(store, enhancedStore);
}

// TODO: Determine if composeWithDevTools can be supported
export function createStore (store) {
  return function (reducer, preloadedState, enhancer?) {
    if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
      enhancer = preloadedState;
      preloadedState = undefined;
    }

    if (typeof enhancer !== 'undefined') {
      if (typeof enhancer !== 'function') {
        throw new Error('Expected the enhancer to be a function.');
      }

      return enhancer(createStore(store))(reducer, preloadedState);
    }

    return mutateStore(store);
  }
}

// TODO: Figure out why thunk actions aren't logged
// (enhanceStore behaves as expected)
export function applyMiddlewareFactory(store: Store<any>, middlewares: any[]) {
  // debugger;
  const middlewareAPI = mutateStore(store);
  const chain = middlewares.map(middleware => middleware(middlewareAPI));

  Object.assign(store, {
    dispatch: compose(...chain)(store.dispatch)
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
