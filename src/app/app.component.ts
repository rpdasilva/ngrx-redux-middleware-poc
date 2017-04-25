import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Apollo } from 'apollo-angular';
import { FooEpics } from '../epics/foo.epics';
import gql from 'graphql-tag';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';

const TrainerQuery = gql`
  query TrainerQuery {
    Trainer(name: "Ash Ketchum") {
      id
      name
      ownedPokemons {
        name
        url
      }
    }
  }
`;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  loading: boolean = true;
  trainer: any;
  ownedPokemon: any;
  foo: any;

  constructor(
    private store: Store<any>,
    private apollo: Apollo,
    private fooEpics: FooEpics
  ) { }

  ngOnInit() {
    this.foo = this.store.select('foo');

    this.store.dispatch({ type: 'CHANGE_FOO', payload: { foo: 'bar' } });
    console.log(this.store);

    setTimeout(() => {
      (this.store as any).dispatch(this.asyncAction());
    }, 1000);

    setTimeout(() => {
      this.store.dispatch({ type: 'EPIC_PING' });
    }, 2000);

    this.trainer = this.apollo
      .watchQuery<any>({ query: TrainerQuery })
      .map(({data}) => data)
      .subscribe(({Trainer, loading}) => {
        this.loading = false;
        this.trainer = Trainer;
        this.ownedPokemon = Trainer.ownedPokemons
      });
  }

  asyncAction() {
    return function (dispatch) {
      return Promise.resolve(1337).then(
        leet => dispatch({ type: 'THUNK', payload: { leet } }),
        error => dispatch({ type: 'THUNK_ERROR', payload: { error } }))
    }
  }

}
