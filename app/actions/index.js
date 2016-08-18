import { store } from '../../index.ios.js';

export const PLACES_COLLECTION = 'PLACES_COLLECTION';
export const DRAWER_TYPE = 'DRAWER_TYPE';
export const SET_USER = 'SET_USER';
export const SEARCH_PLACES = 'SEARCH_PLACES';
export const SEARCH_EVENTS = 'SEARCH_EVENTS';

export const fetchPlaces = (position) => {
  let collection = fetch('http://10.6.23.239:3000/location', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(position)
  })
  .then(function(response) {
    if (response.status === 200) {
      console.log(response);
      return response.json();
    } else  {
      console.log('error');
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

export const placeQuery = (query) => {
  // post request
    let search = fetch('https://agile-peak-45133.herokuapp.com/events', {
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
      console.log('error');
    }
  })
  .catch(function(error) {
    console.error(error);
  });

  console.log(search);

  return {
    type: SEARCH_PLACES,
    payload: search
  };
};

export const eventQuery = (query) => {
  // post request
  let search = fetch('https://agile-peak-45133.herokuapp.com/events', {
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
      console.log('error');
    }
  })
  .catch(function(error) {
    console.error(error);
  });

  console.log(search);

  return {
    type: SEARCH_EVENTS,
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
    return {
      type: SET_USER,
      payload: {
        username: data.name,
        picture: data.picture.data.url
      }
    };
  }
};