import { DETAIL_SELECTED } from '../actions/index';
import { PREVIEW_PANEL_OPEN } from '../actions/index';
import { PREVIEW_PANEL_CLOSE } from '../actions/index';
import { AR_IMAGE_MODE } from '../actions/index';
import { INSIDE_AR_IMAGE_MODE } from '../actions/index';
import { UPDATE_VOTE } from '../actions/index';


const initialState = {
  selectedEvent: null,
  preview: false,
  focalPlace: null,
  ARImageMode: false,
  insideARImageMode: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case DETAIL_SELECTED:
      return { ...state,
      	selectedEvent: action.payload.selectedEvent,
      };
  	case PREVIEW_PANEL_OPEN:
      // console.log('preview action.payload', action.payload);
      return { ...state,
      	focalPlace: action.payload,
      	preview: true
      };
  	case PREVIEW_PANEL_CLOSE:
      return { ...state,
      	preview: false
      };
    case AR_IMAGE_MODE:
      return { ...state,
        ARImageMode: action.payload
      };
    case INSIDE_AR_IMAGE_MODE:
      return { ...state,
        insideARImageMode: action.payload
      };
    case UPDATE_VOTE:
      return { ...state,
        focalPlace: action.payload
      };
    default:
      return state;
  }
}
