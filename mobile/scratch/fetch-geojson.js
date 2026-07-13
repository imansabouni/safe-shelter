const https = require('https');
const fs = require('fs');
const path = require('path');
const osmtogeojson = require('osmtogeojson');

function fetchOverpass(query) {
  return new Promise((resolve, reject) => {
    const data = "data=" + encodeURIComponent(query);
    const options = {
      hostname: 'overpass-api.de',
      port: 443,
      path: '/api/interpreter',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'Node/14'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => resolve(JSON.parse(body)));
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function fetchRegion(name, bbox) {
  console.log(`Fetching ${name}...`);
  const query = `[out:json][timeout:25];way["highway"](${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]});out body;>;out skel qt;`;
  try {
    const data = await fetchOverpass(query);
    console.log(`Converting ${name} to GeoJSON...`);
    const geojson = osmtogeojson(data);
    
    // Yalnızca yolları al
    geojson.features = geojson.features.filter(f => f.geometry.type === 'LineString');
    
    const outPath = path.join(__dirname, '..', 'assets', 'routing', `${name}_roads.json`);
    fs.writeFileSync(outPath, JSON.stringify(geojson));
    console.log(`Saved ${name} to ${outPath} (${geojson.features.length} features)`);
  } catch (err) {
    console.error(`Error fetching ${name}:`, err.message);
  }
}

async function main() {
  await fetchRegion('sefakoy', [40.98, 28.76, 41.02, 28.81]);
  await fetchRegion('tepekent', [41.04, 28.48, 41.07, 28.52]);
}

main();
