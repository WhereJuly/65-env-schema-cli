'use strict';

import envSchema from 'env-schema';
import path from 'path';
import fs from 'fs';

import EnvSchemaCLIException from '@src/exceptions/EnvSchemaCLI.exception.js';
import OASJSONDefinitionsRetrieveService from '@src/shared/OASJSONDefinitionsRetrieve.service.js';
import EnvSchemaCLIErrorVO, { TEnvSchemaErrors } from '@src/core/EnvSchemaCLIError.valueobject.js';

type TSchema = {
    file: string | null;
    value: Record<string, any> | null;
    isFileOrURL: boolean;
};

export default class EnvSchemaCoreService {

    readonly #schema: TSchema;
    readonly #envFileFullPath: string | null;
    readonly #definitionsRetrieveService: OASJSONDefinitionsRetrieveService;

    constructor(schema: string | Record<string, any>, envFile?: string) {
        this.run = this.run.bind(this);
        this.validate = this.validate.bind(this);

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

    public async run(): Promise<Record<string, any>> {
        if (this.#schema.isFileOrURL) {
            this.#schema.value = await this.provideSchemaOrThrow();
        }

        try {
            return this.validate(this.#schema.value!, this.#envFileFullPath);
        } catch (_error) {
            console.dir(_error);

            throw this.prepareEnvSchemaErrorException(_error);
        }
    }

    /**
     * IMPORTANT: Running `envSchema` throws if the env value is missing or does not match schema.
     * It seems to unset loaded variables if the validation fails.
     */
    public validate(schema: Record<string, any>, envFileFullPath: string | null): Record<string, any> {
        const dotEnvConfig = envFileFullPath ? { path: envFileFullPath } : true;


        console.log(schema);
        console.dir(dotEnvConfig);

        return envSchema({
            schema: schema,
            dotenv: dotEnvConfig
        });
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

    private async provideSchemaOrThrow(): Promise<Record<string, any>> {
        try {
            return await this.#definitionsRetrieveService.retrieve(this.#schema.file as string) as Record<string, any>;
        } catch (_error) {
            const error = _error as Error;
            throw new EnvSchemaCLIException(error.message); // NB: Re-throw the current domain exception
        }
    }

    private prepareEnvSchemaErrorException(error_: unknown): EnvSchemaCLIException {
        const error = error_ as TEnvSchemaErrors;

        const errors = error.errors.map((error: TEnvSchemaErrors['errors'][number]) => {
            return new EnvSchemaCLIErrorVO(error);
        });

        return new EnvSchemaCLIException(this.prepareEnvSchemaErrorMessage(), undefined, errors);
    }

    private prepareEnvSchemaErrorMessage(): string {
        const envFile = this.#envFileFullPath ?? `${process.cwd()}.env`;
        const prefix = `The provided env at "${envFile}" does not conform`;
        return this.#schema.isFileOrURL ? `${prefix} to schema at "${this.#schema.file}"` : 'to the given schema object.';
    }

}