'use strict';

import { describe, expect, it } from 'vitest';

import nock from 'nock';

import EnvSchemaCoreService from '@src/core/EnvSchemaCore.service.js';

import fixtures from '@tests/foundation/.ancillary/fixtures/index.js';
import EnvSchemaCLIException from '@src/exceptions/EnvSchemaCLI.exception.js';
import EnvSchemaCLIErrorVO from '@src/core/EnvSchemaCLIError.valueobject.js';

const base = 'http://127.0.0.1:5000';
const server = nock(base);

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

    });
    describe('+run() #1: Should not throw for JSON file or URL', async () => {

        it('Should successfully run for existing JSON schema, no throw', async () => {
            const service = new EnvSchemaCoreService(fixtures.schemaDefaultJSON);
            const actual = service.run;

            await expect(actual()).resolves.toBeDefined();
        });

        it('Should successfully run for schema at URL, no throw', async () => {
            const path = '/json/valid';
            const url = `${base}${path}`;
            server.get(path).reply(200, fixtures.schema_json);

            const service = new EnvSchemaCoreService(url);
            const actual = service.run;

            await expect(actual()).resolves.toBeDefined();
        });

    });

    describe('+run() #2: Should throw for missing or invalid schema file', async () => {

        it.each(dataProvider_run_throws_schema_files())('Case #%# $name', async (data) => {
            const service = new EnvSchemaCoreService(data.schema);
            const actual = service.run;

            await expect(actual).rejects.toThrow(EnvSchemaCLIException);
            await expect(actual).rejects.toThrowError(data.message);
        });

        it('Should throw for invalid env at existing URL', async () => {
            const path = '/json/valid';
            const url = `${base}${path}`;
            // WARNING: For the test to pass we have to keep nock endpoint for 2 requests
            // Will have to clarify later.
            server.get(path).times(2).reply(200, fixtures.schema_json);

            const service = new EnvSchemaCoreService(url, fixtures.envFakeFile);
            const actual = service.run;

            await expect(actual).rejects.toThrow(EnvSchemaCLIException);
            await expect(actual).rejects.toThrowError('at "http://127.0.0.1:5000/json/valid"');
        });

        it('Should throw for missing URL', async () => {
            const path = '/json/invalid';
            const url = `${base}${path}`;
            server.get(path).reply(400, fixtures.schema_json);

            const service = new EnvSchemaCoreService(url);
            const actual = service.run;

            await expect(actual).rejects.toThrow(EnvSchemaCLIException);
            await expect(actual).rejects.toThrowError('network error');
        });

        function dataProvider_run_throws_schema_files() {
            return [
                { name: 'Missing schema file', schema: 'missing-schema-file.json', message: 'missing-schema-file.json" does not exist.' },
                { name: 'Missing .json extension', schema: 'missing-schema-file', message: "must have a '.json' extension" },
                { name: 'Throws for .js extension', schema: fixtures.schemaDefaultJS, message: "must have a '.json' extension" },
            ];
        }

    });

});


