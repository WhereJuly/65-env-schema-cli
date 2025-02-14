#!/usr/bin/env node
'use strict';

import { Command } from 'commander';
import chalk from 'chalk';
import type { PackageJson } from 'types-package-json';
import { createRequire } from "module";

import EnvSchemaCoreService from '@src/core/EnvSchemaCore.service.js';
import EnvSchemaCLIException from '@src/exceptions/EnvSchemaCLI.exception.js';
import EnvSchemaCLIErrorVO from '@src/core/EnvSchemaCLIError.valueobject.js';

const pkg = createRequire(import.meta.url)("../../package.json") as PackageJson;

const program = new Command();

program
    .name(pkg.name)
    .version(pkg.version)
    .description('Validate the env file(s) variables against JSON schema (file or URL).')
    .usage("--schema <file | URL> --env <file>")
    .option('-s, --schema <file | URL>', 'JSON schema file or URL')
    .option('-e, --env [file...]', 'optional env file or files list. Defaults to `.env` at the project root')
    .hook('preAction', (thisCommand, _actionCommand) => {
        const args = thisCommand.opts();

        if (!args.schema) {
            console.log(`\n[${chalk.yellow('WARNING')}] Provide the required "--schema" argument.\n`);

            program.help();
        }
    })
    .action(async (options: { schema: string; env?: string | string[]; }) => {

        // Normalize the env argument to array
        const envs = Array.isArray(options.env) ? options.env : [options.env];

        for (let index = 0; index < envs.length; index++) {
            try {
                const service = new EnvSchemaCoreService(options.schema, envs[index]);
                await service.run();

                console.log(`[${chalk.green('INFO')}] Success. The env variables in" ${service._envFileFullPath}" conforms to schema in "${service.schema.schemaFileOrURL}".`);

            } catch (_error) {
                const error = _error as EnvSchemaCLIException;

                console.log(`\n\r[${chalk.red('ERROR')}]: ${error.message}.`);
                console.log('\nThe following errors were encountered:');
                error.errors?.forEach((error: EnvSchemaCLIErrorVO) => {
                    console.log(` - ${error.message}`);
                });

                program.error('');
            }
        }
    });

async function main() {
    await program.parseAsync(process.argv);
}

await main();