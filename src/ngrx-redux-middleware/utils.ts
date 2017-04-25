export function extractObservableValue (prop, obsv$) {
  let value;
  obsv$[prop].take(1).subscribe(v => value = v);
  return value;
}

export function shimStore (store) {
  return Object.assign({}, store, {
    dispatch: store.dispatch.bind(store),
    // TODO: Why does this cause an infinite loop?
    // dispatch: (...args) => store.dispatch(...args),
    getState: () => {
      let state;
      store.source.take(1).subscribe(s => state = s);
      return state;
    },
    subscribe: (...args) => store.source.subscribe(...args)
  });
}