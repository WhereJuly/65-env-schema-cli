'use strict';

import EnvSchemaCLIErrorVO from '@src/core/EnvSchemaCLIError.valueobject.js';

/**
 * The application-specific exception.
 * 
 * @group Convenience
 * @category Exceptions
 */
export default class EnvSchemaCLIException extends Error {

    public errors: EnvSchemaCLIErrorVO[] | undefined;

    constructor(message: string, originalError?: Error, errors?: EnvSchemaCLIErrorVO[]) {
        const originalMessage = originalError ? ` (original message: ${originalError.message})` : '';

        super(`${message}${originalMessage}`);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, EnvSchemaCLIException);
        }

        this.name = this.constructor.name;
        this.errors = errors;
    }

}