import PLACES_COLLECTION from '../actions/index.js';
console.log(PLACES_COLLECTION, 'PLACES_COLLECTION');

const initialState = {
  testState: true
};

export default function(state = initialState, action) {
  console.log(action);
  switch (action.type) {
    case TEST_ACTION:
      console.log('TEST_ACTION reducer fired');
      return {
        ...state,
        testState: action.payload
      };
    default:
      return state;
  }
}
