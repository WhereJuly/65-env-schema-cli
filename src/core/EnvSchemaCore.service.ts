'use strict';

import envSchema from 'env-schema';
import path from 'path';
import fs from 'fs';

import EnvSchemaCLIException from '@src/exceptions/EnvSchemaCLI.exception.js';
import OASJSONDefinitionsRetrieveService from '@src/shared/OASJSONDefinitionsRetrieve.service.js';
import EnvSchemaCLIErrorVO, { TEnvSchemaErrors } from '@src/exceptions/EnvSchemaCLIError.valueobject.js';

type TSchema = {
    schemaFileOrURL: string | null;
    isFileOrURL: boolean;
    value: Record<string, any> | null;
    isLoaded: boolean;
};

export type TRunReturns = { envFileFullPath: string | null; env: Record<string, any>; };

export default class EnvSchemaCoreService {

    readonly #schema: TSchema;
    readonly #definitionsRetrieveService: OASJSONDefinitionsRetrieveService;

    constructor(schema: string | Record<string, any>) {
        this.run = this.run.bind(this);
        this.validate = this.validate.bind(this);

        this.#schema = {
            schemaFileOrURL: this.isString(schema) ? schema as string : null,
            isFileOrURL: this.isString(schema),
            value: this.isObject(schema) ? schema as Record<string, any> : null,
            isLoaded: false
        };

        if (!this.isValidSchemaArgument()) {
            throw new EnvSchemaCLIException(`The "schema" argument must be either a string or an object, "${typeof schema}" provided.`);
        }

        this.#definitionsRetrieveService = new OASJSONDefinitionsRetrieveService();
    }

    public get schema(): TSchema {
        return this.#schema;
    }

    /**
     * There can be multiple files validated against the same schema.
     */
    public async run(envFile?: string): Promise<TRunReturns> {
        const envFileFullPath = this.constructFullFilePathOrThrow(envFile);

        if (this.shouldLoadSchema()) {
            this.#schema.value = await this.loadSchemaOrThrow();
        }

        try {
            const env = this.validate(this.#schema.value!, envFileFullPath);

            return { envFileFullPath, env };
        } catch (_error) {
            throw this.prepareEnvSchemaErrorException(_error, envFileFullPath);
        }
    }

    /**
     * IMPORTANT: Running `envSchema` throws if the env value is missing or does not match schema.
     * If operated on `process.env` it seems to unset loaded variables if the validation fails.
     */
    public validate(schema: Record<string, any>, envFileFullPath: string): Record<string, any> {
        /**
         * WARNING: 1) We pass `processEnv: destinationEnvVariables` to not write to `process.env`;
         * WARNING: 2) Why we have to pass `data: destinationEnvVariables` second time is not clear from 
         * `env-schema` docs but it is the only way it works. Well see to it later.
         */
        const destinationEnvVariables = {};
        const dotEnvConfig = {
            path: envFileFullPath,
            processEnv: destinationEnvVariables
        };

        envSchema({
            schema: schema,
            data: destinationEnvVariables,
            dotenv: dotEnvConfig
        });

        return destinationEnvVariables;
    }

    private isString(maybeString: any): boolean {
        return typeof maybeString === 'string';
    }

    private isObject(maybeObject: any): boolean {
        return (typeof maybeObject === 'object' && maybeObject !== null);
    }

    private isValidSchemaArgument(): boolean {
        return !!this.schema.schemaFileOrURL || !!this.schema.value;
    }

    private constructFullFilePathOrThrow(envFilePath?: string): string {
        const defaultEnvFile = '.env';
        const fullPath = path.resolve(process.cwd(), envFilePath ?? defaultEnvFile);

        if (!fs.existsSync(fullPath)) {
            throw new EnvSchemaCLIException(`The file at given 'envFilePath' "${fullPath}" does not exist.`);
        }

        return fullPath;
    }

    /**
     * Check if schema should be loaded at all that it was not loaded already.
     */
    private shouldLoadSchema(): boolean {
        return this.#schema.isFileOrURL && !this.#schema.isLoaded;
    }

    private async loadSchemaOrThrow(): Promise<Record<string, any>> {
        try {
            return await this.#definitionsRetrieveService.retrieve(this.#schema.schemaFileOrURL as string) as Record<string, any>;
        } catch (_error) {
            const error = _error as Error;
            throw new EnvSchemaCLIException(error.message); // NB: Re-throw the current domain exception
        }
    }

    private prepareEnvSchemaErrorException(error_: unknown, envFileFullPath: string): EnvSchemaCLIException {
        const error = error_ as TEnvSchemaErrors | Error;

        // NB: This is the invalid JSON schema error
        if (!Object.hasOwn(error, 'errors')) {
            throw new EnvSchemaCLIException(`The schema at "${this.schema.schemaFileOrURL}" is invalid.`, error as Error);
        }

        // NB: Here the given JSON schema is valid, but env values are not. 
        const errors = (error as TEnvSchemaErrors).errors.map((error: TEnvSchemaErrors['errors'][number]) => {
            return new EnvSchemaCLIErrorVO(error);
        });

        return new EnvSchemaCLIException(this.prepareEnvSchemaErrorMessage(envFileFullPath), undefined, errors);
    }

    private prepareEnvSchemaErrorMessage(envFileFullPath: string): string {
        const prefix = `The provided env at "${envFileFullPath}" does not conform`;
        return this.#schema.isFileOrURL ?
            `${prefix} to schema at "${this.schema.schemaFileOrURL}"` :
            `${prefix} to the given schema object.`;
    }

}