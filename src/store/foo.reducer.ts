export function fooReducer (state, action) {
  switch(action.type) {
    case 'CHANGE_FOO': {
      const { foo } = action.payload;
      return foo;
    }

    case 'THUNK': {
      const { leet } = action.payload;
      return leet;
    }

    case 'THUNK_ERROR': {
      const { error } = action.payload;
      return error;
    }

    case 'EPIC_PONG': {
      return 'pong';
    }

    default: {
      return state;
    }
  }
}
