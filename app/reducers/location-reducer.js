import {INIT_POSITION_UPDATE} from '../actions/index';
import {CURRENT_POSITION_UPDATE} from '../actions/index';
import {LOADING_LOCATION} from '../actions/index';


const initialState = {
  initialPosition: null,
  currentPosition: null,
  LastAPICallPosition: null,
  threeLat: 0,
  threeLon: 0,
  distance: 0,
  loading: true
};

export default function(state = initialState, action) {
  switch (action.type) {

    case INIT_POSITION_UPDATE:
      return { ...state,
        initialPosition: action.payload.initialPosition,
        currentPosition: action.payload.initialPosition
      };

    case CURRENT_POSITION_UPDATE:
      // console.log('action.payload', action.payload);
      return { ...state,
        currentPosition: action.payload.currentPosition,
        threeLat: action.payload.threeLat,
        threeLon: action.payload.threeLon,
        distance: action.payload.distance
      };

    case LOADING_LOCATION:
      return { ...state,
        loading: action.payload.loading
      };

    default:
      return state;
  }
};