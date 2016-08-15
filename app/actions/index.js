export const PLACES_COLLECTION = 'PLACES_COLLECTION';
export const DRAWER_TYPE = 'DRAWER_TYPE';
// export const SET_USER = 'SET_USER';

export const fetchPlaces = (position) => {
  let collection = fetch('https://agile-peak-45133.herokuapp.com/location', {
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

export const drawerState = (option) => {
  console.log('drawer state');
  return {
    type: DRAWER_TYPE,
    payload: option
  };
};

// export const setUser = function(name, picture) {
//   let user = {
//     name: name,
//     picture: picture
//   };

//   return {
//     type: SET_USER,
//     payload: user
//   };
// };
