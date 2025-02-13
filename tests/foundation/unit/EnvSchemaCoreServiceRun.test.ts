'use strict';

import { describe, expect, it } from 'vitest';

import nock from 'nock';

import EnvSchemaCoreService from '@src/core/EnvSchemaCore.service.js';

import fixtures from '@tests/foundation/.ancillary/fixtures/index.js';

const base = 'http://127.0.0.1:5000';
const server = nock(base);

describe.skip('[unit] EnvSchemaCoreServiceRunTest', () => {

    describe('+run() #1: Should successfully run for JSON file or URL returning the env content', async () => {

        it('Should successfully run for existing JSON schema file and default .env at project root', async () => {
            const service = new EnvSchemaCoreService(fixtures.schemaFileJSON);
            const actual = await service.run();

            console.dir(actual);
        });

    });

});


