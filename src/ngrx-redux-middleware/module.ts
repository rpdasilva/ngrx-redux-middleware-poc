import { NgModule, OpaqueToken } from '@angular/core';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/take';

import { ngrxReduxStoreFactory, NgrxReduxStore } from './enhanceStore';

const ENHANCER = new OpaqueToken('@@ngrx-redux-middleware/enhancer');

@NgModule({
  providers: [{
    provide: NgrxReduxStore,
    useFactory: ngrxReduxStoreFactory,
    deps: [ Store, ENHANCER ]
  },
  {
    provide: ENHANCER,
    useValue: undefined
  }]
})
export class NgrxReduxMiddlewareModule {
  static enhanceStore (enhancer: any) {
    return {
      ngModule: NgrxReduxMiddlewareModule,
      providers: [
        { provide: ENHANCER, useValue: enhancer }
      ]
    };
  }

  constructor(
    ngrxReduxStore: NgrxReduxStore
  ) { }
}
