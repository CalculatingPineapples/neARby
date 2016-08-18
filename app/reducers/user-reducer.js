import { SET_USER } from '../actions/index';

const initialState = {
  user: '',
  picture: ''
};

export default function(state = initialState, action) {
  console.log(action);
  switch (action.type) {
    case SET_USER:
    console.log('in user reducer');
    console.log(action.payload);
      return { ...state,
      user: action.payload.user,
      picture: action.payload.picture };
    default:
      return state;
  }
};
