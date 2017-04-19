import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { StoreModule, Dispatcher } from '@ngrx/store';
import { applyMiddleware, compose } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';

import { AppComponent } from './app.component';
import { fooReducer } from '../reducers';
import { FooEpics } from '../epics';
import { NgrxReduxMiddlewareModule } from '../ngrx-redux-middleware';

// TODO: AoT weirdness with static analysis of
// applyMiddleware and createLogger ¯\_(ツ)_/¯

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    StoreModule.provideStore({ foo: fooReducer }, { foo: true }),
    // NgrxReduxMiddlewareModule.applyMiddleware([thunk, createLogger()])
    NgrxReduxMiddlewareModule.enhanceStore(
      applyMiddleware(thunk, createLogger())
    )
  ],
  providers: [FooEpics],
  bootstrap: [AppComponent]
})
export class AppModule { }
