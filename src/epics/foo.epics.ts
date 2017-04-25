import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { ActionsObservable } from 'redux-observable';
import { Epic } from 'redux-observable-decorator';
import 'rxjs/add/operator/mapTo';

@Injectable()
export class FooEpics {
  @Epic() epicOne = (action$: ActionsObservable<Action>) => {
    return action$.ofType('EPIC_PING').mapTo({type: 'EPIC_PONG'});
  }
}
