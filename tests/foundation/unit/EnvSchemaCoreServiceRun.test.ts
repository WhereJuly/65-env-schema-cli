'use strict';

import { describe, expect, it } from 'vitest';

import nock from 'nock';

import EnvSchemaCoreService from '@src/core/EnvSchemaCore.service.js';

import fixtures from '@tests/foundation/.ancillary/fixtures/index.js';

const base = 'http://127.0.0.1:5000';
const server = nock(base);

describe('[unit] EnvSchemaCoreServiceRunTest', () => {

    describe('+run() #3: Should successfully run for JSON file or URL returning the env content', async () => {

        it('Should successfully run for existing JSON schema file and default .env at project root', async () => {
            const service = new EnvSchemaCoreService(fixtures.schemaDefaultJSON);
            const actual = await service.run();

            expect(actual).toEqual({ DUMMY: 'development' });
        });

        it.only('Should successfully run for existing JSON schema file and custom env file', async () => {
            const service = new EnvSchemaCoreService(fixtures.schemaFakeJSON, fixtures.envFakeFile);

            const actual = await service.run();

            console.dir(actual);
        });

    });

    // Assert: success JS object;
    // Assert: throws array of my validation errors;

});


