import { Inject, NgModule, OpaqueToken } from '@angular/core';
import { Store, Dispatcher } from '@ngrx/store'
import 'rxjs/add/operator/take';

import { compose } from './compose'

export const APPLY_MIDDLEWARE = new OpaqueToken('@@ngrx-redux-middleware/applyMiddleware');
export const MIDDLEWARES = new OpaqueToken('@@ngrx-redux-middleware/middlewares');

export function applyMiddlewareFactory(store: Store<any>, middlewares: any[]) {
  const middlewareAPI = {
    dispatch: store.dispatch.bind(store),
    getState: () => {
      let state;
      store.take(1).subscribe(s => state = s);
      return state;
    }
  };

  const chain = middlewares.map(middleware => middleware(middlewareAPI));
  store.dispatch = compose(...chain)(middlewareAPI.dispatch);
}

@NgModule({
  providers: [{
    provide: APPLY_MIDDLEWARE,
    useFactory: applyMiddlewareFactory,
    deps: [ Store, MIDDLEWARES ]
  }]
})
export class NgrxReduxMiddlewareModule {
  static applyMiddleware (middlewares: any[] = []) {
    return {
      ngModule: NgrxReduxMiddlewareModule,
      providers: [{
        provide: MIDDLEWARES,
        useValue: middlewares
      }]
    };
  }

  constructor(@Inject(APPLY_MIDDLEWARE) applyMiddleware) { }
}
