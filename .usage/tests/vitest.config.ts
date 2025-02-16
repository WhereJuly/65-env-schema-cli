'use strict';

import { fileURLToPath, pathToFileURL } from 'node:url';
import { cwd } from 'node:process';
import { configDefaults, defineConfig } from 'vitest/config';

const root = pathToFileURL(cwd()).toString();

export default defineConfig({
    plugins: [],
    resolve: {
        alias: {
            '@tests': fileURLToPath(new URL(`${root}/tests`, import.meta.url)),
        }
    },
    test: {
        /**
         * WARNING: To prevent tests hanging.
         * @see https://vitest.dev/guide/common-errors.html#failed-to-terminate-worker
         */
        pool: 'forks',
        fileParallelism: false,
        cache: false,
        reporters: ['verbose'],
        globals: true,
        exclude: configDefaults.exclude,
        root: fileURLToPath(new URL('./', import.meta.url)),
        chaiConfig: {
            truncateThreshold: 200
        }
    }
});
