// const { fetchNearbyPlaces } = require('../services/placesService');

// // ─── Calculate Distance in Meters ─────────────────────────
// function calculateDistance(lat1, lng1, lat2, lng2) {
//   const R = 6371000;
//   const dLat = toRad(lat2 - lat1);
//   const dLng = toRad(lng2 - lng1);
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
//     Math.sin(dLng / 2) * Math.sin(dLng / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return Math.round(R * c);
// }

// function toRad(value) {
//   return (value * Math.PI) / 180;
// }

// // ─── Get Nearby Safe Places ───────────────────────────────
// const getSafePlaces = async (req, res) => {
//   try {
//     const {
//       lat,
//       lng,
//       type = 'all',
//       radius = 5000
//     } = req.query;

//     // Validate required params
//     if (!lat || !lng) {
//       return res.status(400).json({
//         success: false,
//         message: 'Latitude and longitude are required'
//       });
//     }

//     console.log(`📍 Fetching safe places near: ${lat}, ${lng}`);

//     let places = [];

//     if (type === 'all') {
//       // Fetch all types simultaneously
//       const [police, hospitals, malls] = await Promise.all([
//         fetchNearbyPlaces({
//           latitude: lat,
//           longitude: lng,
//           type: 'police',
//           radius,
//         }),
//         fetchNearbyPlaces({
//           latitude: lat,
//           longitude: lng,
//           type: 'hospital',
//           radius,
//         }),
//         fetchNearbyPlaces({
//           latitude: lat,
//           longitude: lng,
//           type: 'mall',
//           radius,
//         }),
//       ]);

//       places = [...police, ...hospitals, ...malls];

//     } else {
//       // Fetch specific type
//       places = await fetchNearbyPlaces({
//         latitude: lat,
//         longitude: lng,
//         type,
//         radius,
//       });
//     }

//     // Add distance to each place
//     places = places.map(place => ({
//       ...place,
//       distance: calculateDistance(
//         parseFloat(lat),
//         parseFloat(lng),
//         place.latitude,
//         place.longitude
//       )
//     }));

//     // Sort by distance
//     places.sort((a, b) => a.distance - b.distance);

//     console.log(`✅ Total ${places.length} safe places found`);

//     return res.status(200).json({
//       success: true,
//       places: places.slice(0, 30),
//     });

//   } catch (error) {
//     console.error('Get safe places error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to get safe places: ' + error.message
//     });
//   }
// };

// module.exports = { getSafePlaces };





const axios = require('axios');
const { fetchNearbyPlaces } = require('../services/placesService');

// ─── Get Location Name from Coordinates ──────────────────
const getLocationName = async (lat, lng) => {
  try {
    const response = await axios.get(
      'https://nominatim.openstreetmap.org/reverse',
      {
        params: {
          lat,
          lon: lng,
          format: 'json',
          zoom: 14,
        },
        headers: {
          'User-Agent': 'SentinelSafetyApp/1.0',
        },
      }
    );

    const address = response.data.address;
    const area =
      address.suburb ||
      address.neighbourhood ||
      address.quarter ||
      address.city_district ||
      '';
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.county ||
      '';

    return area ? `${area}, ${city}` : city;
  } catch (e) {
    console.log('Location name error:', e.message);
    return null;
  }
};

// ─── Calculate Distance in Meters ─────────────────────────
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

// ─── Get Nearby Safe Places ───────────────────────────────
const getSafePlaces = async (req, res) => {
  try {
    const {
      lat,
      lng,
      type = 'all',
      radius = 5000
    } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    console.log(`📍 Fetching safe places near: ${lat}, ${lng}`);

    let places = [];
    let locationName = null;

    if (type === 'all') {
      // Fetch location name + all types simultaneously
      const [name, police, hospitals, malls] =
        await Promise.all([
          getLocationName(lat, lng),
          fetchNearbyPlaces({
            latitude: lat,
            longitude: lng,
            type: 'police',
            radius,
          }),
          fetchNearbyPlaces({
            latitude: lat,
            longitude: lng,
            type: 'hospital',
            radius,
          }),
          fetchNearbyPlaces({
            latitude: lat,
            longitude: lng,
            type: 'mall',
            radius,
          }),
        ]);

      locationName = name;
      places = [...police, ...hospitals, ...malls];

    } else {
      // Fetch location name + specific type simultaneously
      const [name, typePlaces] = await Promise.all([
        getLocationName(lat, lng),
        fetchNearbyPlaces({
          latitude: lat,
          longitude: lng,
          type,
          radius,
        }),
      ]);

      locationName = name;
      places = typePlaces;
    }

    // Add distance to each place
    places = places.map(place => ({
      ...place,
      distance: calculateDistance(
        parseFloat(lat),
        parseFloat(lng),
        place.latitude,
        place.longitude
      )
    }));

    // Sort by distance
    places.sort((a, b) => a.distance - b.distance);

    console.log(`✅ Total ${places.length} safe places found`);
    console.log(`📍 Location: ${locationName}`);

    return res.status(200).json({
      success: true,
      locationName: locationName || 'Your Location',
      places: places.slice(0, 30),
    });

  } catch (error) {
    console.error('Get safe places error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get safe places: ' + error.message
    });
  }
};

module.exports = { getSafePlaces };