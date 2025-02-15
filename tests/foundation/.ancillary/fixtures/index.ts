'use strict';

const basePath = 'tests/foundation/.ancillary/fixtures';

const schemaDefaultJS = `${basePath}/schema.default.js`;
const schemaDefaultJSON = `${basePath}/schema.default.json`;
const schemaFakeJSON = `${basePath}/schema.fake.json`;
const envFakeFile = `${basePath}/.env.fake`;

import schema_json from './schema.default.json' assert { type: 'json' };
import schema_js from './schema.default.js';

export {
    basePath,
    schemaDefaultJS,
    schemaDefaultJSON,
    schemaFakeJSON,
    envFakeFile,
    schema_json,
    schema_js
};

const index = {
    basePath,
    schemaDefaultJS,
    schemaDefaultJSON,
    schemaFakeJSON,
    envFakeFile,
    schema_json,
    schema_js
};

export default index;