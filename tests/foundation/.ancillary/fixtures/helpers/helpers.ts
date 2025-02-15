'use strict';

import { exec } from 'child_process';

export function execAsync(command: string): Promise<{ stdout: string; stderr: string; }> {
    return new Promise((resolve, reject) => {
        return exec(command, (error, stdout, stderr) => {
            if (error) {
                reject({ error, stdout, stderr });
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}