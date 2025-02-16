'use strict';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { execSync } from 'child_process';

const originalCwd = process.cwd();

describe('CLI Application Usage Test', () => {

    // IMPORTANT: Change process.cwd to the project root to make tests pass on the original fixtures.
    beforeAll(() => {
        process.chdir('../');
    });

    afterAll(() => {
        process.chdir(originalCwd);
    });

    describe('Successfully validate default env(s) with schema from JSON file', () => {

        it('Should successfully validate the default env', () => {
            const output = execSync(`npx env-schema-cli -s tests/foundation/.ancillary/fixtures/schema.default.json`).toString();

            expect(output).toEqual(expect.stringContaining('conforms to schema in'));
            expect(output).toEqual(expect.stringContaining('[INFO] The env variables in'));
        });

        it('Should successfully validate multiple env files', () => {
            function countOccurrences(str: string, substr: string) { return str.split(substr).length - 1; }
            const output = execSync(`npx env-schema-cli -s tests/foundation/.ancillary/fixtures/schema.default.json --env .env .env.valid`).toString();

            const actual = countOccurrences(output, '[INFO] The env variables in');
            expect(actual).toEqual(2);
        });

    });

});
