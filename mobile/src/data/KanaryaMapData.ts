export const KANARYA_GEOJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "Kanarya Sınırı" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [28.7750, 41.0050],
          [28.7950, 41.0050],
          [28.7950, 40.9850],
          [28.7750, 40.9850],
          [28.7750, 41.0050]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "İstasyon Caddesi" },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [28.7800, 40.9980],
          [28.7900, 40.9980]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Sahil Yolu" },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [28.7850, 40.9880],
          [28.7940, 40.9850]
        ]
      }
    }
  ]
};
