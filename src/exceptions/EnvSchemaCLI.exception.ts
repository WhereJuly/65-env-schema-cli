'use strict';

/**
 * The application-specific exception.
 * 
 * @group Convenience
 * @category Exceptions
 */
export default class EnvSchemaCLIException extends Error {

    constructor(message: string, originalError?: Error) {
        const originalMessage = originalError ? ` (original message: ${originalError.message})` : '';

        super(`${message}${originalMessage}`);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, EnvSchemaCLIException);
        }

        this.name = this.constructor.name;
    }

}