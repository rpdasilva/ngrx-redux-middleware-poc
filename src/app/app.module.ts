import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { StoreModule, combineReducers } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { applyMiddleware, compose } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import { ApolloModule } from 'apollo-angular';
import { AppComponent } from './app.component';
import { INIIAL_STATE, rootReducer, provideApolloClient, apolloClient } from '../store';
import { FooEpics } from '../epics';
import { NgrxReduxMiddlewareModule } from '../ngrx-redux-middleware';

// TODO: AoT weirdness with static analysis of
// applyMiddleware and createLogger ¯\_(ツ)_/¯

const middleware = [
  thunk,
  apolloClient.middleware(),
  createLogger()
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ApolloModule.forRoot(provideApolloClient),
    StoreModule.provideStore(rootReducer, INIIAL_STATE),
    // NgrxReduxMiddlewareModule.applyMiddleware([thunk, createLogger()])
    NgrxReduxMiddlewareModule.enhanceStore(
      // composeWithDevTools(applyMiddleware(...middleware))
      applyMiddleware(...middleware)
    ),
    StoreDevtoolsModule.instrumentOnlyWithExtension({})
  ],
  providers: [FooEpics],
  bootstrap: [AppComponent]
})
export class AppModule { }
