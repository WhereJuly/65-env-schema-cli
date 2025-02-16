'use strict';

import { EnvSchemaCoreService } from '@wherejuly/env-schema-cli';

// First, create the service using the desired schema. 
const _service = new EnvSchemaCoreService('myapp.schema.json');

// This can be the schema at a URL
const __service = new EnvSchemaCoreService('https://dev.my-project.com/configuration/schema');

// Now run validation.

async function _single() {
    // Will validate the `.env` file at project root (at `process.cwd()`)
    // Returns TReturnResult[] object with env file path and valid env values.
    const _results = await _service.run();
}

async function _many() {
    // Will validate multiple env files
    await _service.run(['.env', '.env.example', '.env.test', 'some/other/.env.file']);
    
    _service.validate({}, '.env');
}

