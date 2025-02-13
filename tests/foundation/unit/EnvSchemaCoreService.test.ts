'use strict';

import { describe, expect, it } from 'vitest';

import EnvSchemaCoreService from '@src/core/EnvSchemaCore.service.js';
import EnvSchemaCLIException from '@src/exceptions/EnvSchemaCLI.exception.js';

describe('[unit] EnvSchemaCoreServiceTest', () => {

    it('+constructor() #1: Should create EnvSchemaCoreService expected object', () => {
        const actual = new EnvSchemaCoreService('dummy',);

        expect(actual).toBeInstanceOf(EnvSchemaCoreService);

        expect(actual.run).toBeInstanceOf(Function);
        expect(actual.validate).toBeInstanceOf(Function);

        expect(actual.schema).toHaveProperty('string');
        expect(actual.schema).toHaveProperty('object');
        expect(actual.schema).toHaveProperty('isObject');
    });

    describe('+constructor() #2: Should explore "schema" expected use cases', () => {

        it.each(dataProvider_schema())('Case #%# $name', (data) => {
            const service = new EnvSchemaCoreService(data.schema);

            const actual = service.schema;

            expect(actual.string).toEqual(data.string);
            expect(actual.object).toEqual(data.object);
            expect(actual.isObject).toEqual(data.is_object);
        });

        function dataProvider_schema() {
            const str = 'dummy'; const obj = {};
            return [
                { name: 'String', schema: str, string: str, object: null, is_object: false },
                { name: 'Object', schema: obj, string: null, object: obj, is_object: true },
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

});


