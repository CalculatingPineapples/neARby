import PLACES_COLLECTION from '../actions/index';

const initialState = {
  collection: []
};

export default function(state = initialState, action) {
  console.log(action);
  switch (action.type) {
    case PLACES_COLLECTION:
    console.log('in reducer');
    console.log(action.payload);
      return { ...state,
      collection: action.payload };
    default:
      return state;
  }
};