'use strict';

import { ErrorObject } from 'ajv';

export type TEnvSchemaErrors = { errors: (ErrorObject & { instancePath: string; })[]; };

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