// const axios = require('axios');
// require('dotenv').config();

// const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// // ─── Place Types Mapping ──────────────────────────────────
// const PLACE_TYPES = {
//   police: 'police',
//   hospital: 'hospital',
//   mall: 'shopping_mall',
//   pharmacy: 'pharmacy',
//   fire_station: 'fire_station',
// };

// // ─── Fetch Nearby Places from Google ─────────────────────
// const fetchNearbyPlaces = async ({
//   latitude,
//   longitude,
//   type,
//   radius = 5000
// }) => {
//   try {
//     const googleType = PLACE_TYPES[type] || type;

//     console.log(`🔍 Fetching ${type} near ${latitude}, ${longitude}`);

//     const response = await axios.get(
//       'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
//       {
//         params: {
//           location: `${latitude},${longitude}`,
//           radius,
//           type: googleType,
//           key: GOOGLE_API_KEY,
//         },
//       }
//     );

//     if (
//       response.data.status !== 'OK' &&
//       response.data.status !== 'ZERO_RESULTS'
//     ) {
//       console.error('Places API error:', response.data.status);
//       return [];
//     }

//     // Format results
//     const places = response.data.results.map(place => ({
//       id: place.place_id,
//       name: place.name,
//       type: type,
//       latitude: place.geometry.location.lat,
//       longitude: place.geometry.location.lng,
//       address: place.vicinity,
//       phone: null,
//       rating: place.rating || null,
//       is_open: place.opening_hours?.open_now ?? null,
//     }));

//     console.log(`✅ Found ${places.length} ${type} places`);
//     return places;

//   } catch (error) {
//     console.error('Places fetch error:', error.message);
//     return [];
//   }
// };

// module.exports = { fetchNearbyPlaces };



// const axios = require('axios');

// // ─── Fetch Nearby Places via OpenStreetMap ────────────────
// const fetchNearbyPlaces = async ({
//   latitude,
//   longitude,
//   type,
//   radius = 5000
// }) => {
//   try {
//     // const osmTags = {
//     //   police: 'amenity=police',
//     //   hospital: 'amenity=hospital',
//     //   mall: 'shop=mall',
//     // };
//     // ─── Fetch Nearby Places via OpenStreetMap ────────────────
// const fetchNearbyPlaces = async ({
//   latitude,
//   longitude,
//   type,
//   radius = 5000
// }) => {
//   try {
//     // For malls use multiple tags to get more results
//     let query;

//     if (type === 'mall') {
//       query = `
//         [out:json][timeout:25];
//         (
//           node["shop"="mall"](around:${radius},${latitude},${longitude});
//           way["shop"="mall"](around:${radius},${latitude},${longitude});
//           node["shop"="supermarket"](around:${radius},${latitude},${longitude});
//           way["shop"="supermarket"](around:${radius},${latitude},${longitude});
//           node["amenity"="marketplace"](around:${radius},${latitude},${longitude});
//           way["amenity"="marketplace"](around:${radius},${latitude},${longitude});
//           node["shop"="department_store"](around:${radius},${latitude},${longitude});
//           way["shop"="department_store"](around:${radius},${latitude},${longitude});
//         );
//         out center 20;
//       `;
//     } else if (type === 'hospital') {
//       query = `
//         [out:json][timeout:25];
//         (
//           node["amenity"="hospital"](around:${radius},${latitude},${longitude});
//           way["amenity"="hospital"](around:${radius},${latitude},${longitude});
//           node["amenity"="clinic"](around:${radius},${latitude},${longitude});
//           way["amenity"="clinic"](around:${radius},${latitude},${longitude});
//         );
//         out center 20;
//       `;
//     } else {
//       query = `
//         [out:json][timeout:25];
//         (
//           node["amenity"="police"](around:${radius},${latitude},${longitude});
//           way["amenity"="police"](around:${radius},${latitude},${longitude});
//         );
//         out center 20;
//       `;
//     }

//     const response = await axios.post(
//       'https://overpass-api.de/api/interpreter',
//       query,
//       {
//         headers: { 'Content-Type': 'text/plain' },
//         timeout: 30000,
//       }
//     );

//     const places = response.data.elements
//       .map(element => {
//         const lat = element.lat || element.center?.lat;
//         const lng = element.lon || element.center?.lon;
//         const tags = element.tags || {};

//         return {
//           id: `osm_${element.id}`,
//           name: tags.name || tags['name:en'] || _getDefaultName(type),
//           type: type,
//           latitude: lat,
//           longitude: lng,
//           address: _buildAddress(tags),
//           phone: tags.phone || tags['contact:phone'] || null,
//           rating: null,
//           is_open: null,
//         };
//       })
//       .filter(p => p.latitude && p.longitude && p.name);

//     console.log(`✅ Found ${places.length} ${type} via OpenStreetMap`);
//     return places;

//   } catch (error) {
//     console.error(`❌ OSM fetch error for ${type}:`, error.message);
//     return [];
//   }
// };

//     const tag = osmTags[type] || 'amenity=police';
//     const [key, value] = tag.split('=');

//     const query = `
//       [out:json][timeout:25];
//       (
//         node["${key}"="${value}"](around:${radius},${latitude},${longitude});
//         way["${key}"="${value}"](around:${radius},${latitude},${longitude});
//       );
//       out center 20;
//     `;

//     const response = await axios.post(
//       'https://overpass-api.de/api/interpreter',
//       query,
//       {
//         headers: { 'Content-Type': 'text/plain' },
//         timeout: 30000,
//       }
//     );

//     const places = response.data.elements
//       .map(element => {
//         const lat = element.lat || element.center?.lat;
//         const lng = element.lon || element.center?.lon;
//         const tags = element.tags || {};

//         return {
//           id: `osm_${element.id}`,
//           name: tags.name || tags['name:en'] || _getDefaultName(type),
//           type: type,
//           latitude: lat,
//           longitude: lng,
//           address: _buildAddress(tags),
//           phone: tags.phone || tags['contact:phone'] || null,
//           rating: null,
//           is_open: null,
//         };
//       })
//       .filter(p => p.latitude && p.longitude && p.name);

//     console.log(`✅ Found ${places.length} ${type} via OpenStreetMap`);
//     return places;

//   } catch (error) {
//     console.error(`❌ OSM fetch error for ${type}:`, error.message);
//     return [];
//   }
// };

// function _buildAddress(tags) {
//   const parts = [];
//   if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
//   if (tags['addr:street']) parts.push(tags['addr:street']);
//   if (tags['addr:city']) parts.push(tags['addr:city']);
//   if (parts.length === 0 && tags['addr:full']) return tags['addr:full'];
//   return parts.length > 0 ? parts.join(', ') : null;
// }

// function _getDefaultName(type) {
//   switch (type) {
//     case 'police': return 'Police Station';
//     case 'hospital': return 'Hospital';
//     case 'mall': return 'Shopping Mall';
//     default: return 'Safe Place';
//   }
// }

// module.exports = { fetchNearbyPlaces };





const axios = require('axios');

// ─── Fetch Nearby Places via OpenStreetMap ────────────────
const fetchNearbyPlaces = async ({
  latitude,
  longitude,
  type,
  radius = 5000
}) => {
  try {
    let query;

    if (type === 'mall') {
      query = `
        [out:json][timeout:25];
        (
          node["shop"="mall"](around:${radius},${latitude},${longitude});
          way["shop"="mall"](around:${radius},${latitude},${longitude});
          node["shop"="supermarket"](around:${radius},${latitude},${longitude});
          way["shop"="supermarket"](around:${radius},${latitude},${longitude});
          node["amenity"="marketplace"](around:${radius},${latitude},${longitude});
          way["amenity"="marketplace"](around:${radius},${latitude},${longitude});
          node["shop"="department_store"](around:${radius},${latitude},${longitude});
          way["shop"="department_store"](around:${radius},${latitude},${longitude});
        );
        out center 20;
      `;
    } else if (type === 'hospital') {
      query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:${radius},${latitude},${longitude});
          way["amenity"="hospital"](around:${radius},${latitude},${longitude});
          node["amenity"="clinic"](around:${radius},${latitude},${longitude});
          way["amenity"="clinic"](around:${radius},${latitude},${longitude});
        );
        out center 20;
      `;
    } else {
      // Police
      query = `
        [out:json][timeout:25];
        (
          node["amenity"="police"](around:${radius},${latitude},${longitude});
          way["amenity"="police"](around:${radius},${latitude},${longitude});
        );
        out center 20;
      `;
    }

    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      query,
      {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 30000,
      }
    );

    const places = response.data.elements
      .map(element => {
        const lat = element.lat || element.center?.lat;
        const lng = element.lon || element.center?.lon;
        const tags = element.tags || {};

        return {
          id: `osm_${element.id}`,
          name: tags.name || tags['name:en'] || _getDefaultName(type),
          type: type,
          latitude: lat,
          longitude: lng,
          address: _buildAddress(tags),
          phone: tags.phone || tags['contact:phone'] || null,
          rating: null,
          is_open: null,
        };
      })
      .filter(p => p.latitude && p.longitude && p.name);

    console.log(`✅ Found ${places.length} ${type} via OpenStreetMap`);
    return places;

  } catch (error) {
    console.error(`❌ OSM fetch error for ${type}:`, error.message);
    return [];
  }
};

// ─── Build Address from OSM Tags ──────────────────────────
function _buildAddress(tags) {
  const parts = [];
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:city']) parts.push(tags['addr:city']);
  if (parts.length === 0 && tags['addr:full']) return tags['addr:full'];
  if (parts.length === 0 && tags['addr:place']) return tags['addr:place'];
  return parts.length > 0 ? parts.join(', ') : null;
}

// ─── Default Name if Missing ──────────────────────────────
function _getDefaultName(type) {
  switch (type) {
    case 'police': return 'Police Station';
    case 'hospital': return 'Hospital';
    case 'mall': return 'Shopping Mall';
    default: return 'Safe Place';
  }
}

module.exports = { fetchNearbyPlaces };