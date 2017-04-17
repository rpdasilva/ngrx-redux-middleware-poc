import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { StoreModule, Dispatcher } from '@ngrx/store';
import { createLogger } from 'redux-logger';

import { AppComponent } from './app.component';
import { NgrxReduxMiddlewareModule } from '../ngrx-redux-middleware';

// export class DispatcherOverload extends Dispatcher {
//   constructor() {
//     console.log('DISPATCHING FROM OVERLOAD');
//     super();
//   }
// }
// Object.setPrototypeOf(Dispatcher, new DispatcherOverload());

export function fooReducer (state, action) {
  switch(action.type) {
    case 'CHANGE_FOO': {
      const { foo } = action.payload;
      return foo;
    }

    default: {
      return state;
    }
  }
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    StoreModule.provideStore({ foo: fooReducer }, { foo: true }),
    NgrxReduxMiddlewareModule.applyMiddleware([createLogger()])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
