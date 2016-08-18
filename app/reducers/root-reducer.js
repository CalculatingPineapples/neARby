import { combineReducers } from 'redux';
import events from './event-reducer';
import places from './places-reducer';
import user from './user-reducer';
import drawer from './drawer-reducer';

const rootReducer = combineReducers({
  places: places,
  events: events,
  user: user,
  drawer: drawer
});

export default rootReducer;