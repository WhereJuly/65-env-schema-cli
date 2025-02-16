# Enhanced `env-schema` CLI

The enhanced CLI and programmatic wrapper around [`env-schema`](https://www.npmjs.com/package/env-schema) that validates environment variables against [JSON Schema](https://json-schema.org/). This package adds support for loading schemas from a file or URL and validating multiple environment files against the same schema.

Its purpose is to be used as a CLI in a separate build/CI step or to be programmatically integrated into custom build pipelines.

**How it works**

- Pass the package your env's JSON schema as a local JSON file, a URL, or an object in programmatic usage.
- Optionally, provide one or multiple `.env` files to check against the schema. Otherwise, it defaults to `.env` at your project root.
- The file(s) either pass the check, or the package returns an error when values mismatch the JSON schema.

---

**Package Status**

![Codecov](https://img.shields.io/codecov/c/github/WhereJuly/65-env-schema-cli?color=%2308A108)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=WhereJuly_65-env-schema-cli&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=WhereJuly_65-env-schema-cli)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=WhereJuly_65-env-schema-cli&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=WhereJuly_65-env-schema-cli)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=WhereJuly_65-env-schema-cli&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=WhereJuly_65-env-schema-cli)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=WhereJuly_65-env-schema-cli&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=WhereJuly_65-env-schema-cli)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=WhereJuly_65-env-schema-cli&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=WhereJuly_65-env-schema-cli)

![npm bundle size](https://img.shields.io/bundlephobia/min/env-schema-cli)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/env-schema-cli)
![npm version](https://img.shields.io/npm/v/env-schema-cli?color=green)
![npm downloads](https://img.shields.io/npm/dm/env-schema-cli.svg?color=green)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?color=green)](https://opensource.org/licenses/MIT)

---

**Contents**

- [Usage](#usage)
- [Programmatic Usage](#programmatic-usage)
  - [The Core Service](#the-core-service)
  - [`.run()`](#run)
  - [`.validate()`](#validate)
  - [Exceptions Handling](#exceptions-handling)
- [Maintenance](#maintenance)
  - [Contributions](#contributions)
  - [License](#license)

---

## Usage

Install the package.

```bash
npm install --save-dev env-schema-cli
```

Validate `.env` at the project root.

```bash
npx env-schema-cli --schema src/config/env/env.schema.json
```

Validate multiple env files. Use subfolder where needed.

```bash
npx env-schema-cli --schema src/config/env/env.schema.json --env .env .env.example some/folder/.env.other
```

Provide your schema from URL

```bash
npx env-schema-cli --schema https://config.my-project.tld/config/app.schema.json --env .env .env.example
```

The CLI provides informative output for success or failure for better scripts debug.

## Programmatic Usage

For programmatic usage the thorough documentation is available in the JSDoc blocks hover-able with your IDE (e.g. VSCode).

Note that the package isolates operations from any actual `process.env` and does not modify it. All envs - incoming and outgoing are kept in the internal objects.

### The Core Service

```typescript
/**
 * First, create the service using the desired schema.
 * Use schemas from subfolders or URL as needed.
 */
const service = new EnvSchemaCoreService('my-app.schema.json');
```

### `.run()`

The signature:

`public async run(envFile?: string | string[]): Promise<[TRunReturns, ...TRunReturns[]]>`

```typescript
/**
 * Now validate the single `.env` file at project root (at `process.cwd()`)
 * The `results` type is `TReturnResult[]` array of objects with env file path and
 * valid env values just for the case.
 */
const results = await service.run();

// Run the validation for a single custom env file
await service.run('some/other/.env.file');

// or for multiple env files.
await service.run(['.env', '.env.example', '.env.test', 'some/other/.env.file']);
```

The `.run()` method returns [`TRunReturns[]`](src/core/EnvSchemaCore.service.ts) array of objects ior throws [the exception](#exceptions-handling).

### `.validate()`

The signature:

`public validate(schema: Record<string, any>, envFileFullPath: string): Record<string, any>`

Generally, it is not assumed for sole use; nevertheless, it may be useful occasionally. See the JSDoc for more info.

### Exceptions Handling

The service throws the [`EnvSchemaCLIException`](src/exceptions/EnvSchemaCLI.exception.ts). The exception includes the original error message where appropriate. The env fields errors, if any, are accumulated in the `EnvSchemaCLIException.errors` property typed [`EnvSchemaCLIErrorVO[]`](src/exceptions/EnvSchemaCLIError.valueobject.ts).

## Maintenance

The package is written in TypeScript with the informative JSDoc blocks available on hover for public interface (e.g. in VS Code) for comfortable programmatic usage. The code is carefully crafted with TDD allowing simple extension. The project is production-ready and actively maintained.

### Contributions

Potentially valuable use cases / functionality suggestions as well as usage questions are welcome in [Discussions](https://github.com/WhereJuly/65-env-schema-cli/discussions).

If there is a [pull request](https://github.com/WhereJuly/65-env-schema-cli/pulls), I would receive it on `integration` branch for discussion and manual merge.

### License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
