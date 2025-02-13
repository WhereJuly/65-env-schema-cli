'use strict';

const basePath = './tests/foundation/.ancillary/fixtures';

const schemaFileJS = `${basePath}/schema.fixture.js`;
const schemaFileJSON = `${basePath}/schema.fixture.json`;
const envFile = `${basePath}/.env.fake`;

import schema_json from './schema.fixture.json' assert { type: 'json' };

export {
    basePath,
    schemaFileJS,
    schemaFileJSON,
    envFile,
    schema_json
};

const index = {
    basePath,
    schemaFileJS,
    schemaFileJSON,
    envFile,
    schema_json
};

export default index;