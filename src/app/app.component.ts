import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { FooEpics } from '../epics/foo.epics';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  foo: any;

  constructor(
    private store: Store<any>,
    private fooEpics: FooEpics
  ) { }

  ngOnInit() {
    this.foo = this.store.select('foo')

    this.store.dispatch({ type: 'CHANGE_FOO', payload: { foo: 'bar' } });

    setTimeout(() => {
      (this.store as any).dispatch(this.asyncAction());
    }, 1000);

    // setTimeout(() => {
    //   this.store.dispatch({ type: 'PING' });
    // }, 2000);
  }

  asyncAction() {
    return function (dispatch) {
      return Promise.resolve(1337).then(
        leet => dispatch({ type: 'LEET', payload: { leet } }),
        error => dispatch({ type: 'LEET_ERROR', payload: { error } }))
    }
  }

}
