'use strict';

export const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
};

/**
 * NB: Set TEST_INCLUDE=.examples,.explorations to include tests from the basically excluded folders. 
*/
export default function excluded(defaults: string[]) {
    const base = [...defaults, 'e2e/*'];
    const additional = ['**/examples', '**/explorations', '**/integration/.external', '.usage'];

    const toInclude = process.env.TEST_INCLUDE?.split(',') || [];

    const excluded = additional.filter((_additional: string) => {
        return !toInclude.some((_toInclude: string) => { return _additional.includes(_toInclude); });
    });

    console.log(`[${colors.green}INFO${colors.reset}] Additionally excluded test folders "${excluded.toString()}"`);
    console.log(`[${colors.green}INFO${colors.reset}] Run "npx cross-env TEST_INCLUDE=<folder-a,folder-b,name-part> npm run test:foundation" to include tests from the basically excluded folders.`);

    return base.concat(excluded);
}