'use strict';

import envSchema from 'env-schema';
import { ValidationError } from 'ajv';

import EnvSchemaCLIException from '@src/exceptions/EnvSchemaCLI.exception.js';

type TSchema = {
    string: string | null;
    object: Record<string, any> | null;
    isObject: boolean;
};

export default class EnvSchemaCoreService {

    readonly #schema: TSchema;
    readonly #envFilePath: string | undefined;

    // This should save the input arguments making them available for `.run()` method.
    // Analyzes `schema`, if `string` puts the value to private `_schema.string`, otherwise in `_schema.object`;
    // Set `_schema.isObject` to true when needed.
    // Exposes the `schema` getter`.
    // Stores envFilePath in private `_envFilePath`. 
    constructor(schema: string | Record<string, any>, envFilePath?: string) {
        this.#schema = {
            string: this.isString(schema) ? schema as string : null,
            object: this.isObject(schema) ? schema as Record<string, any> : null,
            isObject: this.isObject(schema)
        };

        if (!this.isValidSchemaArgument()) {
            throw new EnvSchemaCLIException(`The "schema" argument must be either a string or an object, "${typeof schema}" provided.`);
        }

        this.#envFilePath = envFilePath;
    }

    public get schema(): TSchema {
        return this.#schema;
    }

    // This has to prepare schema (load from file or URL) and `envFilePath`.
    // It then runs `.validate()` with these parameters.
    // It should check the env file exists (construct full name) and throw EnvSchemaException if not.
    // It should delegate to my schema loader module loading the schema and re-throw EnvSchemaException
    public run(): void {
        // WRITE:;
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
        return !!this.schema.string || !!this.schema.object;
    }

}