'use strict';

import { describe, expect, it } from 'vitest';

import EnvSchemaCoreService from '@src/core/EnvSchemaCore.service.js';
import EnvSchemaCLIException from '@src/exceptions/EnvSchemaCLI.exception.js';

import fixtures from '@tests/foundation/.ancillary/fixtures/index.js';

describe('[unit] EnvSchemaCoreServiceConstructTest', () => {

    it('+constructor() #1: Should create EnvSchemaCoreService expected object', () => {
        const actual = new EnvSchemaCoreService('dummy',);

        expect(actual).toBeInstanceOf(EnvSchemaCoreService);

        expect(actual.run).toBeInstanceOf(Function);
        expect(actual.validate).toBeInstanceOf(Function);

        expect(actual.schema).toHaveProperty('schemaFileOrURL');
        expect(actual.schema).toHaveProperty('value');
        expect(actual.schema).toHaveProperty('isFileOrURL');
    });

    describe('+constructor() #2: Should explore "schema" expected use cases', () => {

        it.each(dataProvider_schema())('Case #%# $name', (data) => {
            const service = new EnvSchemaCoreService(data.schema);

            const actual = service.schema;

            expect(actual.schemaFileOrURL).toEqual(data.file);
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
        const actual = () => { new EnvSchemaCoreService('dummy', fixtures.envFakeFile); }; // NOSONAR

        expect(actual).not.toThrow();
    });

    it('+constructor() #5: Should throw for missing "envFile" file', () => {
        const actual = () => { new EnvSchemaCoreService('dummy', 'missing-env-file'); }; // NOSONAR

        expect(actual).toThrow(EnvSchemaCLIException);
        expect(actual).toThrowError('missing-env-file" does not exist.');
    });

});


