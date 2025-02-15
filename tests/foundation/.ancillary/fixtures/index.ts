'use strict';

const basePath = 'tests/foundation/.ancillary/fixtures';

const schemaDefaultJS = `${basePath}/schema.default.js`;
const schemaDefaultJSON = `${basePath}/schema.default.json`;
const schemaFakeJSON = `${basePath}/schema.fake.json`;
const envFakeFile = `${basePath}/.env.fake`;

import schema_json from './schema.default.json' assert { type: 'json' };
import schema_js from './schema.default.js';
import not_json_schema from './not-json-schema.json' assert { type: 'json' };

export {
    basePath,
    schemaDefaultJS,
    schemaDefaultJSON,
    schemaFakeJSON,
    envFakeFile,
    schema_json,
    schema_js,
    not_json_schema
};

const index = {
    basePath,
    schemaDefaultJS,
    schemaDefaultJSON,
    schemaFakeJSON,
    envFakeFile,
    schema_json,
    schema_js,
    not_json_schema
};

export default index;