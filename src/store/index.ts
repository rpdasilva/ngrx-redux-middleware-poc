import { combineReducers } from '@ngrx/store';
import { fooReducer } from './foo.reducer';
import { apolloClient } from './apollo.config';

export * from './foo.reducer';
export * from './apollo.config';

export const INIIAL_STATE = {
  foo: true,
  apollo: {}
};

export const rootReducer = combineReducers({
  foo: fooReducer,
  apollo: apolloClient.reducer()
});
