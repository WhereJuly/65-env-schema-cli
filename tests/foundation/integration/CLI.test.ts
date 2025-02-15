'use strict';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import fs from 'fs';
import { exec, execSync } from 'child_process';

describe('CLI Application', () => {

    describe('[cli] Successfully validate default env with schema from JSON file', () => {
        const output = execSync(`tsx src/cli/cli.ts`).toString();

        it.todo('+dummy() #4: Should successfully accept "envFile" argument', () => {
        });


    });

});
