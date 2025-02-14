'use strict';

import { describe, expect, it } from 'vitest';

// import nock from 'nock';

import EnvSchemaCoreService from '@src/core/EnvSchemaCore.service.js';

import fixtures from '@tests/foundation/.ancillary/fixtures/index.js';
import EnvSchemaCLIException from '@src/exceptions/EnvSchemaCLI.exception.js';
import EnvSchemaCLIErrorVO from '@src/core/EnvSchemaCLIError.valueobject.js';

// const base = 'http://127.0.0.1:5000';
// const server = nock(base);

describe('[unit] EnvSchemaCoreServiceRunTest', () => {

    describe('+run() #3: Should successfully run for JSON file or URL returning the env content', async () => {

        it('Should successfully run for existing JSON schema file and default .env at project root', async () => {
            const service = new EnvSchemaCoreService(fixtures.schemaDefaultJSON);
            const actual = await service.run();

            expect(actual).toEqual({ DUMMY: 'development' });
        });

        it('Should successfully run JSON schema from JS object and default env', async () => {
            const service = new EnvSchemaCoreService(fixtures.schema_js);

            const actual = await service.run();

            expect(actual).toEqual({ DUMMY: 'development' });
        });

        it('Should successfully run for existing JSON schema file and custom env file', async () => {
            const service = new EnvSchemaCoreService(fixtures.schemaFakeJSON, fixtures.envFakeFile);

            const actual = await service.run();

            expect(actual).toEqual({ ENV: 'fake' });
        });

        it('Should throw expected message for object schema and fake env', async () => {
            const service = new EnvSchemaCoreService(fixtures.schema_js, fixtures.envFakeFile);

            try {
                const _env = await service.run();
                // console.dir(env);

                throw new Error('The test was expected to throw but it did not.');

            } catch (_error) {
                const actual = _error as EnvSchemaCLIException;

                expect(actual).toBeInstanceOf(EnvSchemaCLIException);
                expect(actual.message).toEqual(expect.stringContaining('does not conform to the given schema object'));

                expect(actual.errors).toHaveLength(1);
                expect(actual.errors![0]).toBeInstanceOf(EnvSchemaCLIErrorVO);
                expect(actual.errors![0]?.details).toEqual('{"missingProperty":"DUMMY"}');
            }
        });


        it.todo('Should throw with array of EnvSchemaCLIErrorVO', async () => {
        });

    });

    // Assert: success JS object;
    // Assert: throws array of my validation errors;

});


