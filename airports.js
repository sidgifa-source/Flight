// بيانات المطارات الحقيقية (مبسطة)
const AIRPORTS = {
  HECA: {
    icao: 'HECA', name: 'مطار القاهرة الدولي',
    lat: 30.1219, lon: 31.4056, elevation: 116,
    runway: { heading: 50, length: 4000, width: 60 },
  },
  HEAX: {
    icao: 'HEAX', name: 'مطار الإسكندرية الدولي',
    lat: 31.1839, lon: 29.9486, elevation: 50,
    runway: { heading: 40, length: 3400, width: 45 },
  },
  HESL: {
    icao: 'HESL', name: 'مطار الأقصر الدولي',
    lat: 25.6708, lon: 32.7064, elevation: 88,
    runway: { heading: 20, length: 3000, width: 45 },
  },
};

// تحويل lat/lon إلى إحداثيات 3D (مسطحة محلياً)
function latLonTo3D(lat, lon, refLat, refLon) {
  const METERS_PER_DEG = 111320;
  const x = (lon - refLon) * METERS_PER_DEG * Math.cos(refLat * Math.PI / 180);
  const z = -(lat - refLat) * METERS_PER_DEG;
  return new THREE.Vector3(x, 0, z);
}