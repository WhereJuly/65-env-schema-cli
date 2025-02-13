'use strict';

import { describe, expect, it } from 'vitest';

import nock from 'nock';

import EnvSchemaCoreService from '@src/core/EnvSchemaCore.service.js';
import EnvSchemaCLIException from '@src/exceptions/EnvSchemaCLI.exception.js';

import fixtures from '@tests/foundation/.ancillary/fixtures/index.js';

const base = 'http://127.0.0.1:5000';
const server = nock(base);

describe('[unit] EnvSchemaCoreServiceTest', () => {

    it('+constructor() #1: Should create EnvSchemaCoreService expected object', () => {
        const actual = new EnvSchemaCoreService('dummy',);

        expect(actual).toBeInstanceOf(EnvSchemaCoreService);

        expect(actual.run).toBeInstanceOf(Function);
        expect(actual.validate).toBeInstanceOf(Function);

        expect(actual.schema).toHaveProperty('file');
        expect(actual.schema).toHaveProperty('value');
        expect(actual.schema).toHaveProperty('isFileOrURL');
    });

    describe('+constructor() #2: Should explore "schema" expected use cases', () => {

        it.each(dataProvider_schema())('Case #%# $name', (data) => {
            const service = new EnvSchemaCoreService(data.schema);

            const actual = service.schema;

            expect(actual.file).toEqual(data.file);
            expect(actual.value).toEqual(data.value);
            expect(actual.isFileOrURL).toEqual(data.is_ile_or_url);
        });

        function dataProvider_schema() {
            const file = 'dummy'; const value = {};
            return [
                { name: 'String', schema: file, file: file, value: null, is_ile_or_url: true },
                { name: 'Object', schema: value, file: null, value: value, is_ile_or_url: false },
            ];
        }
    });

    it('+constructor() #3: Should throw the exception for unexpected "schema" argument', () => {
        const actual = () => {
            new EnvSchemaCoreService(0 as unknown as string); // NOSONAR
        };

        expect(actual).toThrow(EnvSchemaCLIException);
        expect(actual).toThrowError('"number" provided');
    });

    it('+constructor() #4: Should successfully accept "envFile" argument', () => {
        const actual = () => { new EnvSchemaCoreService('dummy', fixtures.envFile); }; // NOSONAR

        expect(actual).not.toThrow();
    });

    it('+constructor() #5: Should throw for missing "envFile" file', () => {
        const actual = () => { new EnvSchemaCoreService('dummy', 'missing-env-file'); }; // NOSONAR

        expect(actual).toThrow(EnvSchemaCLIException);
        expect(actual).toThrowError('missing-env-file" does not exist.');
    });

    describe('+run() #1: Should not throw for JSON file or URL', async () => {

        it('Should successfully run for existing JSON schema, no throw', async () => {
            const service = new EnvSchemaCoreService(fixtures.schemaFileJSON);
            const actual = service.run;

            await expect(actual()).resolves.toEqual({ DUMMY: 'development' });
        });

        it('Should successfully run for schema at URL, no throw', async () => {
            const path = '/json/valid';
            const url = `${base}${path}`;
            server.get(path).reply(200, fixtures.schema_json);

            const service = new EnvSchemaCoreService(url);
            const actual = service.run;

            await expect(actual()).resolves.toEqual({ DUMMY: 'development' });
        });

    });

    describe('+run() #2: Should throw for missing or invalid schema file', async () => {

        it.each(dataProvider_run_throws_schema_files())('Case #%# $name', async (data) => {
            const service = new EnvSchemaCoreService(data.schema);
            const actual = service.run;

            await expect(actual).rejects.toThrow(EnvSchemaCLIException);
            await expect(actual).rejects.toThrowError(data.message);
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
                { name: 'Throws for .js extension', schema: fixtures.schemaFileJS, message: "must have a '.json' extension" },
            ];
        }

    });

    // Assert: retrieve file
    // Assert: retrieve URL
    // Assert: retrieve throws for missing schema file
    // Assert: retrieve throws for non-json schema file
    // Assert: retrieve URL throws for HTTP error



});


