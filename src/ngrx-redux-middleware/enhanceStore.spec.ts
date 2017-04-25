import { ReflectiveInjector } from '@angular/core';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
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

    expect(methods).toContain('getState')
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

  // TODO: Wat
  xit('preserves the state when replacing a reducer', () => {
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

//   it('only accepts plain object actions', () => {
//     const store = enhanceStore(reducers.todos)
//     expect(() =>
//       store.dispatch(unknownAction())
//     ).not.toThrow()

//     function AwesomeMap() { }
//     [ null, undefined, 42, 'hey', new AwesomeMap() ].forEach(nonObject =>
//       expect(() =>
//         store.dispatch(nonObject)
//       ).toThrow(/plain/)
//     )
//   })

//   it('handles nested dispatches gracefully', () => {
//     function foo(state = 0, action) {
//       return action.type === 'foo' ? 1 : state
//     }

//     function bar(state = 0, action) {
//       return action.type === 'bar' ? 2 : state
//     }

//     const store = enhanceStore(combineReducers({ foo, bar }))

//     store.subscribe(function kindaComponentDidUpdate() {
//       const state = store.getState()
//       if (state.bar === 0) {
//         store.dispatch({ type: 'bar' })
//       }
//     })

//     store.dispatch({ type: 'foo' })
//     expect(store.getState()).toEqual({
//       foo: 1,
//       bar: 2
//     })
//   })

  it('does not allow dispatch() from within a reducer', () => {
    const enhancedStore = enhanceStore(store)(reducers.dispatchInTheMiddleOfReducer)

    expect(() =>
      enhancedStore.dispatch(dispatchInMiddle(enhancedStore.dispatch(unknownAction())))
    ).toThrow(/may not dispatch/)
  })
});

//   it('recovers from an error within a reducer', () => {
//     const store = enhanceStore(reducers.errorThrowingReducer)
//     expect(() =>
//       store.dispatch(throwError())
//     ).toThrow()

//     expect(() =>
//       store.dispatch(unknownAction())
//     ).not.toThrow()
//   })

//   it('throws if action type is missing', () => {
//     const store = enhanceStore(reducers.todos)
//     expect(() =>
//       store.dispatch({})
//     ).toThrow(/Actions may not have an undefined "type" property/)
//   })

//   it('throws if action type is undefined', () => {
//     const store = enhanceStore(reducers.todos)
//     expect(() =>
//       store.dispatch({ type: undefined })
//     ).toThrow(/Actions may not have an undefined "type" property/)
//   })

//   it('does not throw if action type is falsy', () => {
//     const store = enhanceStore(reducers.todos)
//     expect(() =>
//       store.dispatch({ type: false })
//     ).not.toThrow()
//     expect(() =>
//       store.dispatch({ type: 0 })
//     ).not.toThrow()
//     expect(() =>
//       store.dispatch({ type: null })
//     ).not.toThrow()
//     expect(() =>
//       store.dispatch({ type: '' })
//     ).not.toThrow()
//   })

//   it('accepts enhancer as the third argument', () => {
//     const emptyArray = []
//     const spyEnhancer = vanillaCreateStore => (...args) => {
//       expect(args[0]).toBe(reducers.todos)
//       expect(args[1]).toBe(emptyArray)
//       expect(args.length).toBe(2)
//       const vanillaStore = vanillaCreateStore(...args)
//       return {
//         ...vanillaStore,
//         dispatch: jest.fn(vanillaStore.dispatch)
//       }
//     }

//     const store = createStore(reducers.todos, emptyArray, spyEnhancer)
//     const action = addTodo('Hello')
//     store.dispatch(action)
//     expect(store.dispatch).toBeCalledWith(action)
//     expect(store.getState()).toEqual([
//       {
//         id: 1,
//         text: 'Hello'
//       }
//     ])
//   })

//   it('accepts enhancer as the second argument if initial state is missing', () => {
//     const spyEnhancer = vanillaCreateStore => (...args) => {
//       expect(args[0]).toBe(reducers.todos)
//       expect(args[1]).toBe(undefined)
//       expect(args.length).toBe(2)
//       const vanillaStore = vanillaCreateStore(...args)
//       return {
//         ...vanillaStore,
//         dispatch: jest.fn(vanillaStore.dispatch)
//       }
//     }

//     const store = createStore(reducers.todos, spyEnhancer)
//     const action = addTodo('Hello')
//     store.dispatch(action)
//     expect(store.dispatch).toBeCalledWith(action)
//     expect(store.getState()).toEqual([
//       {
//         id: 1,
//         text: 'Hello'
//       }
//     ])
//   })

//   it('throws if enhancer is neither undefined nor a function', () => {
//     expect(() =>
//       createStore(reducers.todos, undefined, {})
//     ).toThrow()

//     expect(() =>
//       createStore(reducers.todos, undefined, [])
//     ).toThrow()

//     expect(() =>
//       createStore(reducers.todos, undefined, null)
//     ).toThrow()

//     expect(() =>
//       createStore(reducers.todos, undefined, false)
//     ).toThrow()

//     expect(() =>
//       createStore(reducers.todos, undefined, undefined)
//     ).not.toThrow()

//     expect(() =>
//       createStore(reducers.todos, undefined, x => x)
//     ).not.toThrow()

//     expect(() =>
//       createStore(reducers.todos, x => x)
//     ).not.toThrow()

//     expect(() =>
//       createStore(reducers.todos, [])
//     ).not.toThrow()

//     expect(() =>
//       createStore(reducers.todos, {})
//     ).not.toThrow()
//   })

//   it('throws if nextReducer is not a function', () => {
//     const store = createStore(reducers.todos)

//     expect(() =>
//       store.replaceReducer()
//     ).toThrow('Expected the nextReducer to be a function.')

//     expect(() =>
//       store.replaceReducer(() => {})
//     ).not.toThrow()
//   })

//   it('throws if listener is not a function', () => {
//     const store = createStore(reducers.todos)

//     expect(() =>
//       store.subscribe()
//     ).toThrow()

//     expect(() =>
//       store.subscribe('')
//     ).toThrow()

//     expect(() =>
//       store.subscribe(null)
//     ).toThrow()

//     expect(() =>
//       store.subscribe(undefined)
//     ).toThrow()
//   })

//   describe('Symbol.observable interop point', () => {
//     it('should exist', () => {
//       const store = createStore(() => {})
//       expect(typeof store[$$observable]).toBe('function')
//     })

//     describe('returned value', () => {
//       it('should be subscribable', () => {
//         const store = createStore(() => {})
//         const obs = store[$$observable]()
//         expect(typeof obs.subscribe).toBe('function')
//       })

//       it('should throw a TypeError if an observer object is not supplied to subscribe', () => {
//         const store = createStore(() => {})
//         const obs = store[$$observable]()

//         expect(function () {
//           obs.subscribe()
//         }).toThrow()

//         expect(function () {
//           obs.subscribe(() => {})
//         }).toThrow()

//         expect(function () {
//           obs.subscribe({})
//         }).not.toThrow()
//       })

//       it('should return a subscription object when subscribed', () => {
//         const store = createStore(() => {})
//         const obs = store[$$observable]()
//         const sub = obs.subscribe({})
//         expect(typeof sub.unsubscribe).toBe('function')
//       })
//     })

//     it('should pass an integration test with no unsubscribe', () => {
//       function foo(state = 0, action) {
//         return action.type === 'foo' ? 1 : state
//       }

//       function bar(state = 0, action) {
//         return action.type === 'bar' ? 2 : state
//       }

//       const store = createStore(combineReducers({ foo, bar }))
//       const observable = store[$$observable]()
//       const results = []

//       observable.subscribe({
//         next(state) {
//           results.push(state)
//         }
//       })

//       store.dispatch({ type: 'foo' })
//       store.dispatch({ type: 'bar' })

//       expect(results).toEqual([ { foo: 0, bar: 0 }, { foo: 1, bar: 0 }, { foo: 1, bar: 2 } ])
//     })

//     it('should pass an integration test with an unsubscribe', () => {
//       function foo(state = 0, action) {
//         return action.type === 'foo' ? 1 : state
//       }

//       function bar(state = 0, action) {
//         return action.type === 'bar' ? 2 : state
//       }

//       const store = createStore(combineReducers({ foo, bar }))
//       const observable = store[$$observable]()
//       const results = []

//       const sub = observable.subscribe({
//         next(state) {
//           results.push(state)
//         }
//       })

//       store.dispatch({ type: 'foo' })
//       sub.unsubscribe()
//       store.dispatch({ type: 'bar' })

//       expect(results).toEqual([ { foo: 0, bar: 0 }, { foo: 1, bar: 0 } ])
//     })

//     it('should pass an integration test with a common library (RxJS)', () => {
//       function foo(state = 0, action) {
//         return action.type === 'foo' ? 1 : state
//       }

//       function bar(state = 0, action) {
//         return action.type === 'bar' ? 2 : state
//       }

//       const store = createStore(combineReducers({ foo, bar }))
//       const observable = Rx.Observable.from(store)
//       const results = []

//       const sub = observable
//         .map(state => ({ fromRx: true, ...state }))
//         .subscribe(state => results.push(state))

//       store.dispatch({ type: 'foo' })
//       sub.unsubscribe()
//       store.dispatch({ type: 'bar' })

//       expect(results).toEqual([ { foo: 0, bar: 0, fromRx: true }, { foo: 1, bar: 0, fromRx: true } ])
//     })
//   })
// })
