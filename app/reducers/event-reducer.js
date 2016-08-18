import { EVENTS_COLLECTION } from '../actions/index';

const initialState = {
  events: []
};

export default function(state = initialState, action) {
  switch (action.type) {
    case EVENTS_COLLECTION:
      return {
        ...state,
        events: action.payload
      };
    default:
      return state;
  }
}
