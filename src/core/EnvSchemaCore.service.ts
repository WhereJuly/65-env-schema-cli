'use strict';

import envSchema from 'env-schema';
import path from 'path';
import fs from 'fs';
import { ValidationError } from 'ajv';

import EnvSchemaCLIException from '@src/exceptions/EnvSchemaCLI.exception.js';
import OASJSONDefinitionsRetrieveService from '@src/shared/OASJSONDefinitionsRetrieve.service.js';

type TSchema = {
    file: string | null;
    value: Record<string, any> | null;
    isFileOrURL: boolean;
};

export default class EnvSchemaCoreService {

    readonly #definitionsRetrieveService: OASJSONDefinitionsRetrieveService;
    readonly #schema: TSchema;
    readonly #envFileFullPath: string | null;

    // This should save the input arguments making them available for `.run()` method.
    // Analyzes `schema`, if `string` puts the value to private `_schema.string`, otherwise in `_schema.object`;
    // Set `_schema.isObject` to true when needed.
    // Exposes the `schema` getter`.
    // Stores envFilePath in private `_envFilePath`. 
    constructor(schema: string | Record<string, any>, envFile?: string) {

        this.#schema = {
            file: this.isString(schema) ? schema as string : null,
            value: this.isObject(schema) ? schema as Record<string, any> : null,
            isFileOrURL: this.isString(schema)
        };

        if (!this.isValidSchemaArgument()) {
            throw new EnvSchemaCLIException(`The "schema" argument must be either a string or an object, "${typeof schema}" provided.`);
        }

        this.#envFileFullPath = this.constructFullFilePathOrThrow(envFile);

        this.#definitionsRetrieveService = new OASJSONDefinitionsRetrieveService();
    }

    public get schema(): TSchema {
        return this.#schema;
    }

    // This has to prepare schema (load from file or URL) and `envFilePath`.
    // It then runs `.validate()` with these parameters.
    // It should check the env file exists (construct full name) and throw EnvSchemaException if not.
    // It should delegate to my schema loader module loading the schema and re-throw EnvSchemaException
    // WRITE:;
    public async run(): Promise<void> {
        if (this.#schema.isFileOrURL) {
            // WRITE: TDD
            this.#schema.value = await this.#definitionsRetrieveService.retrieve(this.#schema.file as string) as Record<string, any>;
        }

    }

    /**
     * IMPORTANT: Running `envSchema` throws if the env value is missing or does not match schema.
     * It seems to unset loaded variables if the validation fails.
     * 
     */
    public validate(schema: Record<string, any>, envFileFullPath?: string): Record<string, any> {
        const config = envSchema({
            schema: schema,
            // data: data, // optional, default: process.env
            dotenv: true // load .env if it is there, default: false
        });

        return config;
    }

    private isString(maybeString: any): boolean {
        return typeof maybeString === 'string';

    }

    private isObject(maybeObject: any): boolean {
        return (typeof maybeObject === 'object' && maybeObject !== null);
    }

    private isValidSchemaArgument(): boolean {
        return !!this.schema.file || !!this.schema.value;
    }

    private constructFullFilePathOrThrow(envFilePath?: string): string | null {
        if (!envFilePath) { return null; }

        const fullPath = path.resolve(process.cwd(), envFilePath);

        // WRITE: assert;
        if (!fs.existsSync(fullPath)) {
            throw new EnvSchemaCLIException(`The file at given 'envFilePath' "${fullPath}" does not exist.`);
        }

        return fullPath;
    }

}