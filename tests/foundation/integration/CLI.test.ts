'use strict';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';


import fixtures from '@tests/foundation/.ancillary/fixtures/index.js';
import { execAsync } from '@tests/foundation/.ancillary/bootstrap/helpers/helpers.js';

import { getLocal } from 'mockttp';
import { execSync } from 'child_process';

const port = 5001;
const base = `http://localhost:${port}`;
const server = getLocal();

describe('[integration] CLI Application', () => {

    beforeAll(async () => {
        await server.start(port);
    });

    afterEach(() => {
        server.reset();
    });

    afterAll(async () => {
        await server.stop();
    });

    it('Should show required arguments warning', () => {
        const output = execSync(`tsx src/cli/cli.ts`).toString();

        expect(output).toEqual(expect.stringContaining('[WARNING] Provide the required "--schema" argument'));
    });

    describe('Successfully validate default env(s) with schema from JSON file', () => {

        it('Should successfully validate the default env', () => {
            const output = execSync(`tsx src/cli/cli.ts -s tests/foundation/.ancillary/fixtures/schema.default.json`).toString();

            expect(output).toEqual(expect.stringContaining('conforms to schema in'));
            expect(output).toEqual(expect.stringContaining('[INFO] The env variables in'));
        });

        it('Should successfully validate multiple env files', () => {
            function countOccurrences(str: string, substr: string) { return str.split(substr).length - 1; }
            const output = execSync(`tsx src/cli/cli.ts -s tests/foundation/.ancillary/fixtures/schema.default.json --env .env .env.valid`).toString();

            const actual = countOccurrences(output, '[INFO] The env variables in');
            expect(actual).toEqual(2);
        });

    });

    describe('Validate default env(s) with schema from URL', () => {

        it('Should throw for missing URL', async () => {
            const path = '/json/missing';
            const url = `${base}${path}`;
            // INFO: Intentionally do not create the mock server endpoint

            try {
                await execAsync(`tsx src/cli/cli.ts -s ${url}`);
                
                throw new Error('Unexpected flow with no expected error');
            } catch (_error) {
                const { stdout: actual } = _error as { error: string, stdout: string; stderr: string; };

                expect(actual).toEqual(expect.stringContaining(`[ERROR]: There was a network error fetching the URL "${url}"`));
            }
        });

        it('Should successfully validate the default env', async () => {
            const path = '/json/valid';
            const url = `${base}${path}`;
            await server.forGet(path).thenReply(200, JSON.stringify(fixtures.schema_json));

            const { stdout: actual } = await execAsync(`tsx src/cli/cli.ts -s ${url}`);

            expect(actual).toEqual(expect.stringContaining('[INFO] The env variables in'));
            expect(actual).toEqual(expect.stringContaining('conforms to schema in'));
        });

        it('Should throw for non-JSON schema at URL', async () => {
            const path = '/json/invalid';
            const url = `${base}${path}`;
            await server.forGet(path).thenReply(200, JSON.stringify(fixtures.not_json_schema));

            try {
                await execAsync(`tsx src/cli/cli.ts -s ${url}`);

                throw new Error('Unexpected flow with no expected error');
            } catch (_error) {
                const { stdout: actual } = _error as { error: string, stdout: string; stderr: string; };

                expect(actual).toEqual(expect.stringContaining(`[ERROR]: The schema at "${url}" is invalid`));
            }

        });

    });

});
