'use strict';

import envSchema from 'env-schema';
import path from 'path';
import fs from 'fs';

import EnvSchemaCLIException from '@src/exceptions/EnvSchemaCLI.exception.js';
import OASJSONDefinitionsRetrieveService from '@src/shared/OASJSONDefinitionsRetrieve.service.js';
import EnvSchemaCLIErrorVO, { TEnvSchemaErrors } from '@src/exceptions/EnvSchemaCLIError.valueobject.js';

/**
 * Represents the schema configuration used by `EnvSchemaCoreService`.
 * This type defines the structure for managing schema data, which can be either
 * a file, a URL or a JS object.
 * 
 * It tracks whether the schema is loaded and its current value.
 * 
 * @property {string | null} schemaFileOrURL The path or URL to the schema file. Null if the schema is provided as an object.
 * @property {boolean} isFileOrURL Indicates whether the schema is sourced from a file/URL (`true`) or provided as an object (`false`).
 * @property {Record<string, any> | null} value The loaded or provided schema object. Null if the schema is not yet loaded.
 * @property {boolean} isLoaded Indicates whether the schema has been successfully loaded.
 * 
 * @see {@link EnvSchemaCoreService#schema} The getter that provides access to the current 
 * schema configuration.
 */
export type TSchema = {
    schemaFileOrURL: string | null;
    isFileOrURL: boolean;
    value: Record<string, any> | null;
    isLoaded: boolean;
};

/**
 * Represents the result of running the schema validation process.
 * 
 * @property {string | null} envFileFullPath - The full path to the environment file that was validated. 
 * Null if no file was provided.
 * @property {Record<string, any>} env - The parsed and validated environment variables.
 */
export type TRunReturns = { envFileFullPath: string | null; env: Record<string, any>; };

/**
 * Core service for validating environment variables against a JSON schema.
 * This class handles loading schema files or URLs, validating environment files against the schema,
 * and managing schema-related errors. It supports both file-based and object-based schemas.
 * 
 * The service does not impact the `process.env` in any way. 
 * All env operations are internally isolated.
 * 
 * @param {string | Record<string, any>} schema - The schema to validate against. 
 * Can be a file path, URL, or a schema object.
 * 
 * @throws {EnvSchemaCLIException} If the schema argument is invalid (not a string or object).
 * 
 * @property {TSchema} schema The getter returning {@link TSchema}.
 * @method run Runs the validation process.
 * @method validate Validates a given schema against environment.
 */
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

    /**
     * Provides access to the current schema configuration.
     * 
     * @returns {TSchema} The schema configuration.
     */
    public get schema(): TSchema {
        return this.#schema;
    }

    /**
     * Manges the validation process. Loads the schema on demand and runs validation.
     * 
     * @param {string} [envFile] - The path to the environment file. 
     * Defaults to `.env` in the current working directory.
     * 
     * @returns {Promise<TRunReturns>} See {@link TRunReturns}.
     * 
     * @throws {EnvSchemaCLIException} If the schema is invalid, the file does not exist, or validation fails.
     */
    public async run(envFile?: string | string[]): Promise<[TRunReturns, ...TRunReturns[]]> {
        if (this.shouldLoadSchema()) {
            this.#schema.value = await this.loadSchemaOrThrow();
        }

        const envFiles = Array.isArray(envFile) ? envFile : [envFile];

        const results = envFiles.map((envFile_: string | undefined) => {
            return this.runSingle(envFile_);
        });

        return results as [TRunReturns, ...TRunReturns[]];
    }

    /**
     * Validates environment variables against the provided schema without modifying `process.env`.
     * 
     * @param {Record<string, any>} schema The schema to validate against.
     * 
     * @param {string} envFileFullPath The full path to the environment file being validated.
     * @returns {Record<string, any>} The parsed and validated environment variables object.
     * @throws {EnvSchemaCLIException} If the environment variables do not conform to the schema.
     * 
     * IMPORTANT: Running `envSchema` throws if the env value is missing or does not match schema.
     * NB: If operated on `process.env` it seems to unset loaded variables if the validation fails
     * (not the case with this service as it does not use `process.env`).
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

    private runSingle(envFile?: string): TRunReturns {
        const envFileFullPath = this.constructFullFilePathOrThrow(envFile);

        try {
            const env = this.validate(this.#schema.value!, envFileFullPath);

            return { envFileFullPath, env };
        } catch (_error) {
            throw this.prepareOrThrowEnvSchemaErrorException(_error, envFileFullPath);
        }
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

    /**
     * Either throws or returns a custom `EnvSchemaCLIException` based on the validation error.
     * Handles both invalid JSON schema errors and environment value validation errors.
     * 
     * @param {unknown} error_ The error caught during environment variables validation.
     * @param {string} envFileFullPath The full path to the environment file being validated.
     * 
     * @throws {EnvSchemaCLIException} If schema is not a JSON schema.
     * 
     * @returns {EnvSchemaCLIException} In case of env validation errors.
     */
    private prepareOrThrowEnvSchemaErrorException(error_: unknown, envFileFullPath: string): EnvSchemaCLIException {
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