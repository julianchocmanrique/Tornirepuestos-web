const fs = require('node:fs');
const config = JSON.parse(fs.readFileSync(0, 'utf8'));
const service = Object.entries(config.services).find(([, value]) => value.container_name === 'tornirepuestos-web');
if (!service) throw new Error('No se encontró el servicio tornirepuestos-web.');
const override = {
  services: { [service[0]]: {
    environment: { BAILE_DATA_DIR: '/app/data/baile' },
    volumes: [{ type: 'volume', source: 'baile_data', target: '/app/data/baile' }],
  } },
  volumes: { baile_data: { name: 'tornirepuestos_baile_data' } },
};
process.stdout.write(JSON.stringify(override, null, 2));
