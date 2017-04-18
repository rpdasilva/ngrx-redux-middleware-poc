import { Injectable } from '@angular/core';

@Injectable()
export class FooEpics {
  epicOne = (action$) => {
    return action$.ofType('PING').mapTo({type: 'PONG'})
  }
}