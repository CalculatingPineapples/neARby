import { store } from '../../index.ios.js';

export const PLACES_COLLECTION = 'PLACES_COLLECTION';
export const DRAWER_TYPE = 'DRAWER_TYPE';
export const SET_USER = 'SET_USER';
export const SEARCH_PLACES = 'SEARCH_PLACES';
export const SEARCH_EVENTS = 'SEARCH_EVENTS';
export const DETAIL_SELECTED = 'DETAIL_SELECTED';
export const SEARCH_PHOTOS = 'SEARCH_PHOTOS';
export const UPDATE_EVENT_QUERY = 'UPDATE_EVENT_QUERY';
export const UPDATE_PLACE_QUERY = 'UPDATE_PLACE_QUERY';
export const GET_DIRECTIONS = 'GET_DIRECTIONS';
export const RESET_SEARCH = 'RESET_SEARCH';
export const RESET_PLACES_UPDATE = 'RESET_PLACES_UPDATE';

export const fetchPlaces = (position) => {
  let collection = fetch('http://10.6.23.239:3000/location', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(position)
  })
  .then(function(response) {
    if (response.status === 200) {
      console.log(response);
      return response.json();
    } else  {
      return [];
      console.log('error');
    }
  })
  .catch(function(error) {
    console.error(error);
    return [];
  });
  userPlacesQuery(position);
  return {
    type: PLACES_COLLECTION,
    payload: collection
  };
};

export const placeQuery = (query) => {
  console.log('test the placeQuery out')
  // post request
  let search = fetch('http://10.6.23.239:3000/places', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(query)
  })
  .then(function(response) {
    if (response.status === 200) {
      return response.json();
    } else  {
      return [];
    }
  })
  .catch(function(error) {
    console.error(error);
    return [];
  });
  // userPlacesQuery(query);
  return {
    type: SEARCH_PLACES,
    payload: search
  };
};

export const eventQuery = (query) => {
  // post request
    let search = fetch('http://10.6.23.239:3000/events', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(query)
  })
  .then(function(response) {
    if (response.status === 200) {
      return response.json();
    } else  {
      return [];
    }
  })
  .catch(function(error) {
    console.error(error);
    return [];
  });
  userEventQuery(query);
  return {
    type: SEARCH_EVENTS,
    payload: search
  };
};

export const userEventQuery = (query) => {
  // post request
    let search = fetch('http://10.6.23.239:3000/db/getPlace', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(query)
  })
  .then(function(response) {
    if (response.status === 200) {
      return response.json();
    } else  {
      return [];
    }
  })
  .catch(function(error) {
    console.error(error);
    return [];
  });
  return {
    type: USER_EVENTS,
    payload: search
  };
};

export const userPlacesQuery = (query) => {
  // post request
  console.log('test the user place query out')
    let search = fetch('http://10.6.23.239:3000/db/getPlaces', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(query)
  })
  .then(function(response) {
    if (response.status === 200) {
      return response.json();
    } else  {
      return [];
    }
  })
  .catch(function(error) {
    console.error(error);
    return [];
  });
  console.log('testing userPlaceQuery', search);
  return {
    type: USER_PLACES,
    payload: search
  };
};

export const updatePlaceQuery = (query) => {
  return {
    type: UPDATE_PLACE_QUERY,
    payload: query
  }
}

export const updateEventQuery = (query) => {
  return {
    type: UPDATE_EVENT_QUERY,
    payload: query
  }
}

export const imageQuery = (query) => {
  // post request
  let search = fetch('http://10.6.23.239:3000/images', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(query)
  })
  .then(function(response) {
    if (response.status === 200) {
      console.log(response);
      return response.json();
    } else  {
      return [];
    }
  })
  .catch(function(error) {
    console.error(error);
    return [];
  });

  return {
    type: SEARCH_PHOTOS,
    payload: search
  };
};

export const directionsQuery = (query) => {
  let search = fetch('http://10.6.23.239:3000/directions', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(query)
  })
  .then(function(response) {
    if (response.status === 200) {
      return response.json();
    } else  {
      console.log('error getting directions: ', response);
    }
  })
  .catch(function(error) {
    console.error('error getting directions: ', error);
  });
  return {
    type: GET_DIRECTIONS,
    payload: search
  };
};

export const drawerState = (option, isOpen) => {
  // isOpen = isOpen ? !store.getState.drawerState.isOpen :  store.getState.drawerState.isOpen;
  return {
    type: DRAWER_TYPE,
    payload: {
      option: option,
      // isOpen: isOpen
    }
  };
};

export const getUserInfo = (err, data) => {
  if (err) {
    console.log('ERR ', err);
  } else {
    console.log(data, 'data');
    return {
      type: SET_USER,
      payload: {
        username: data.name,
        picture: data.picture.data.url,
        id: data.id,
        // friends: data.friends.data
      }
    };
  }
};

export const selectPlace = (data) => {
  return {
    type: DETAIL_SELECTED,
    payload: {
      selectedEvent: data
    }
  };
};

export const resetSearch = () => {
  return {
    type: RESET_SEARCH,
    payload: 'none'
  };
};


export const resetPlaceUpdate = () => {
  return {
    type: RESET_PLACES_UPDATE,
    payload: false
  };
};

//////////////////////////////
////geolocation handlers
//////////////////////////////
export const INIT_POSITION_UPDATE = 'INIT_POSITION_UPDATE';
export const CURRENT_POSITION_UPDATE = 'CURRENT_POSITION_UPDATE';
export const LOADING_LOCATION = 'LOADING_LOCATION';

export const updateInitLocation = (location) => {
  console.log('updateInitLocation');
  console.log('location',location);
  return {
    type: INIT_POSITION_UPDATE,
    payload: {
      initialPosition: location,
    }
  };
};

export const updateCurrentLocation = (location) => {
  console.log('updateCurrentLocation');
  return {
    type: CURRENT_POSITION_UPDATE,
    payload: {
      currentPosition: location.currentPosition,
      threeLat: location.threeLat,
      threeLon: location.threeLon,
      distance: location.distance
    }
  };
};

export const finishLoadingPosition = (boolean) => {
  console.log('updateCurrentHeading');
  return {
    type: LOADING_LOCATION,
    payload: {
      loading: boolean
    }
  };
};

//////////////////////////////
////user creation handlers
//////////////////////////////
export const USER_PLACES = 'USER_PLACES';
export const USER_EVENTS = 'USER_EVENTS';

export const addPlace = (place) => {
  let search = fetch('http://10.6.23.239:3000/db/createPlace', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(place)
  })
  .then(function(response) {
    if (response.status === 200) {
      return response.json();
    } else  {
      console.log('error getting directions: ', response);
    }
  })
  .catch(function(error) {
    console.error('error getting directions: ', error);
  });
  console.log('testing addPlace', search)
  return {
    type: USER_PLACES,
    payload: search
  };
};

export const addEvent = (event) => {
  console.log('addEvent');
    let search = fetch('http://10.6.23.239:3000/db/createEvent', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event)
  })
  .then(function(response) {
    if (response.status === 200) {
      return response.json();
    } else  {
      console.log('error getting directions: ', response);
    }
  })
  .catch(function(error) {
    console.error('error getting directions: ', error);
  });
  return {
    type: USER_EVENTS,
    payload: search
  };
};

//////////////////////////////
////preview handlers
//////////////////////////////
export const PREVIEW_PANEL_OPEN = 'PREVIEW_PANEL_OPEN';
export const PREVIEW_PANEL_CLOSE = 'PREVIEW_PANEL_CLOSE';

export const openPreview = (key) => {
  console.log('openPreview');
  return {
    type: PREVIEW_PANEL_OPEN,
    payload: {
      preview: true,
      focalPlace: key
    }
  };
};

export const closePreview = () => {
  console.log('closePreview');
  return {
    type: PREVIEW_PANEL_CLOSE,
    payload: {
      preview: false
    }
  };
};

//////////////////////////////
////place ratings
//////////////////////////////
export const sendVote = (place) => {
  console.log('votePlace');
  let collection = fetch('https://agile-peak-45133.herokuapp.com/vote', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(place)
  })
  .then(function(response) {
    if (response.status === 200) {
      console.log('response', response);
      return response.json();
    } else  {
      console.log('error');
      return [];
    }
  })
  .catch(function(error) {
    console.error(error);
  });

  return {
    type: PLACES_COLLECTION,
    payload: collection
  };
};
