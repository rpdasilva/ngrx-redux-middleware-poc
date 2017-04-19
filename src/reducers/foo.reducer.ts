export function fooReducer (state, action) {
  switch(action.type) {
    case 'CHANGE_FOO': {
      const { foo } = action.payload;
      return foo;
    }

    case 'LEET': {
      const { leet } = action.payload;
      return leet;
    }

    case 'LEET_ERROR': {
      const { error } = action.payload;
      return error;
    }

    case 'PONG': {
      return 'pong';
    }

    default: {
      return state;
    }
  }
}