'use strict';

import { ErrorObject } from 'ajv';

export type TEnvSchemaErrors = { errors: (ErrorObject & { instancePath: string; })[]; };

/**
 * Represents a validation error for an environment variable.
 * This class encapsulates details about the variable, error message, and additional parameters.
 * It takes the data from `env-schema` error object and exposes the data useful for `env-schema-cli`
 * 
 * @param {TEnvSchemaErrors['errors'][number]} envSchemaError The error object from schema validation.
 * 
 * @property {string} variable The environment variable path that caused the error.
 * @property {string | undefined} message The error message describing the validation failure.
 * @property {string} details Additional details about the error, serialized as a JSON string.
 */
export default class EnvSchemaCLIErrorVO {

    public variable: string;
    public message: string | undefined;
    public details: string;

    constructor(envSchemaError: TEnvSchemaErrors['errors'][number]) {
        this.variable = envSchemaError.instancePath;
        this.message = envSchemaError.message;
        this.details = JSON.stringify(envSchemaError.params);
    }

}