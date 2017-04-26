import { ReflectiveInjector } from '@angular/core';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import $$observable from 'symbol-observable';
import { enhanceStore } from './enhanceStore';
import { addTodo, dispatchInMiddle, throwError, unknownAction } from '../testing/helpers/actionCreators';
import * as reducers from '../testing/helpers/reducers';
import * as Rx from 'rxjs';

const REDUCER = reducers.todos;
const INITIAL_VALUE: any = [];

function createStore (reducer = REDUCER, initialValue = INITIAL_VALUE) {
  const injector = ReflectiveInjector.resolveAndCreate([
    StoreModule.provideStore(reducer, initialValue).providers
  ]);

  return injector.get(Store);
}

describe('enhanceStore', () => {
  let store: Store<any>;

  beforeEach(() => {
    store = createStore();
  });

  it('is shimmed with getState', () => {
    const enhancedStore = enhanceStore(store)(REDUCER, INITIAL_VALUE);
    const methods = Object.keys(enhancedStore);

    expect(methods).toContain('dispatch')
    expect(methods).toContain('getState')
    expect(methods).toContain('replaceReducer')
    expect(methods).toContain('subscribe')
  })

  it('getState returns initial state', () => {
    const store = createStore(undefined, { foo: true })
    const enhancedStore = enhanceStore(store)(REDUCER, INITIAL_VALUE)
    expect(enhancedStore.getState()).toEqual({ foo: true })
  })

  it('getState returns previous state', () => {
    const enhancedStore = enhanceStore(store)(REDUCER, INITIAL_VALUE)
    expect(enhancedStore.getState()).toEqual([])

    enhancedStore.dispatch(unknownAction())
    expect(enhancedStore.getState()).toEqual([])

    enhancedStore.dispatch(addTodo('Hello'))
    expect(enhancedStore.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ])

    store.dispatch(addTodo('World'))
    expect(enhancedStore.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }, {
        id: 2,
        text: 'World'
      }
    ])
  })

  it('preserves the state when replacing a reducer', () => {
    const enhancedStore = enhanceStore(store)(reducers.todos)
    enhancedStore.dispatch(addTodo('Hello'))
    enhancedStore.dispatch(addTodo('World'))
    expect(enhancedStore.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      },
      {
        id: 2,
        text: 'World'
      }
    ])

    enhancedStore.replaceReducer(reducers.todosReverse)
    expect(enhancedStore.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }, {
        id: 2,
        text: 'World'
      }
    ])

    enhancedStore.dispatch(addTodo('Perhaps'))
    expect(enhancedStore.getState()).toEqual([
      {
        id: 3,
        text: 'Perhaps'
      },
      {
        id: 1,
        text: 'Hello'
      },
      {
        id: 2,
        text: 'World'
      }
    ])

    enhancedStore.replaceReducer(reducers.todos)
    expect(enhancedStore.getState()).toEqual([
      {
        id: 3,
        text: 'Perhaps'
      },
      {
        id: 1,
        text: 'Hello'
      },
      {
        id: 2,
        text: 'World'
      }
    ])

    enhancedStore.dispatch(addTodo('Surely'))
    expect(enhancedStore.getState()).toEqual([
      {
        id: 3,
        text: 'Perhaps'
      },
      {
        id: 1,
        text: 'Hello'
      },
      {
        id: 2,
        text: 'World'
      },
      {
        id: 4,
        text: 'Surely'
      }
    ])
  })

  it('accepts enhancer as the third argument', () => {
    let dispatchSpy;
    const emptyArray = []
    const spyEnhancer = vanillaCreateStore => (...args) => {
      expect(args[0]).toBe(reducers.todos)
      expect(args[1]).toBe(emptyArray)
      expect(args.length).toBe(2)
      const vanillaStore = vanillaCreateStore(...args)
      dispatchSpy = spyOn(vanillaStore, 'dispatch').and.callThrough();

      return {
        ...vanillaStore,
        dispatch: vanillaStore.dispatch
      }
    }

    const enhancedStore = enhanceStore(store)(reducers.todos, emptyArray, spyEnhancer)
    const action = addTodo('Hello')
    enhancedStore.dispatch(action)
    expect(enhancedStore.dispatch).toHaveBeenCalledWith(action)
    expect(enhancedStore.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ])
  })

  it('accepts enhancer as the second argument if initial state is missing', () => {
    let dispatchSpy;
    const spyEnhancer = vanillaCreateStore => (...args) => {
      expect(args[0]).toBe(reducers.todos)
      expect(args[1]).toBe(undefined)
      expect(args.length).toBe(2)
      const vanillaStore = vanillaCreateStore(...args)
      dispatchSpy = spyOn(vanillaStore, 'dispatch').and.callThrough();

      return {
        ...vanillaStore,
        dispatch: vanillaStore.dispatch
      }
    }

    const enhancedStore = enhanceStore(store)(reducers.todos, spyEnhancer)
    const action = addTodo('Hello')
    enhancedStore.dispatch(action)
    expect(enhancedStore.dispatch).toHaveBeenCalledWith(action)
    expect(enhancedStore.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ])
  })

  it('throws if enhancer is neither undefined nor a function', () => {
    expect(() =>
      enhanceStore(store)(reducers.todos, undefined, {})
    ).toThrow()

    expect(() =>
      enhanceStore(store)(reducers.todos, undefined, [])
    ).toThrow()

    expect(() =>
      enhanceStore(store)(reducers.todos, undefined, null)
    ).toThrow()

    expect(() =>
      enhanceStore(store)(reducers.todos, undefined, false)
    ).toThrow()

    expect(() =>
      enhanceStore(store)(reducers.todos, undefined, undefined)
    ).not.toThrow()

    expect(() =>
      enhanceStore(store)(reducers.todos, undefined, x => x)
    ).not.toThrow()

    expect(() =>
      enhanceStore(store)(reducers.todos, x => x)
    ).not.toThrow()

    expect(() =>
      enhanceStore(store)(reducers.todos, [])
    ).not.toThrow()

    expect(() =>
      enhanceStore(store)(reducers.todos, {})
    ).not.toThrow()
  })

  it('throws if nextReducer is not a function', () => {
    const enhancedStore = enhanceStore(store)(reducers.todos)

    expect(() =>
      enhancedStore.replaceReducer()
    ).toThrow()

    expect(() =>
      enhancedStore.replaceReducer(() => {})
    ).not.toThrow()
  })

  describe('Symbol.observable interop point', () => {
    it('should exist', () => {
      const enhancedStore = enhanceStore(store)(() => {})
      expect(typeof store[$$observable]).toBe('function')
    })

    // TODO: Get this example working
    xit('should pass an integration test with a common library (RxJS)', () => {
      function foo(state = 0, action) {
        return action.type === 'foo' ? 1 : state
      }

      function bar(state = 0, action) {
        return action.type === 'bar' ? 2 : state
      }

      const enhancedStore = enhanceStore(store)(combineReducers({ foo, bar }))
      const observable = Rx.Observable.from(enhancedStore)
      const results = []

      const sub = observable
        .map(state => ({ fromRx: true, ...state }))
        .subscribe(state => results.push(state))

      enhancedStore.dispatch({ type: 'foo' })
      sub.unsubscribe()
      enhancedStore.dispatch({ type: 'bar' })

      expect(results).toEqual([ { foo: 0, bar: 0, fromRx: true }, { foo: 1, bar: 0, fromRx: true } ])
    })
  })
})
