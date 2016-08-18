import { PLACES_COLLECTION } from '../actions/index';
import { SEARCH_PLACES } from '../actions/index';

const initialState = {
  places: [],
  placeQuery: {
    food: false,
    hotel: false,
    cafes: false,
    nightlife: false,
    shopping: false,
    publicTransit: false,
    bank: false,
    gasStation: false,
    parking: false,
    park: false,
    placeSearch: ''
  }
};

export default function(state = initialState, action) {
  switch (action.type) {
    case PLACES_COLLECTION:
      return {
        ...state,
        places: action.payload
      };
    case SEARCH_PLACES:
      return {
        ...state,
        placeQuery: action.payload
      };
    default:
      return state;
  }
}
