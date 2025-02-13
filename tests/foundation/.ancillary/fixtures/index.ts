'use strict';

const basePath = './tests/foundation/.ancillary/fixtures';

const schemaFileJS = `${basePath}/schema.fixture.js`;
const schemaFileJSON = `${basePath}/schema.fixture.json`;
const envFile = `${basePath}/.env.fake`;

export {
    basePath,
    schemaFileJS,
    schemaFileJSON,
    envFile
};

const index = {
    basePath,
    schemaFileJS,
    schemaFileJSON,
    envFile
};

export default index;