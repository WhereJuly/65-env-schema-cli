# `env-schema` CLI

The tiny CLI and programmatic wrapper for [`env-schema`](https://www.npmjs.com/package/env-schema) environment variables validator.

Its purpose is to be used as CLI in a separate build / CI step or being programmatically engaged in your build pipeline. It provides convenient one or multiple env files validation to ensure they all conform to the same [JSON Schema](https://json-schema.org/) schema you define.

**How it works**

- Pass the package your env's JSON schema either as local JSON file or URL (or as object for programmatic usage).
- Optionally provide one or multiple `.env` files to check vs the schema. Otherwise it defaults to `.env` at the your project root.
- The file(s) either pass the check or the package errors when values mismatch with the JSON schema.

---

**Package Status**

![npm bundle size](https://img.shields.io/bundlephobia/min/env-schema-cli)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/env-schema-cli)
![npm version](https://img.shields.io/npm/v/env-schema-cli?color=green)
![npm downloads](https://img.shields.io/npm/dm/env-schema-cli.svg?color=green)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?color=green)](https://opensource.org/licenses/MIT)

![Codecov](https://img.shields.io/codecov/c/github/WhereJuly/65-env-schema-cli?color=%2308A108)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=WhereJuly_65-env-schema-cli&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=WhereJuly_65-env-schema-cli)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=WhereJuly_65-env-schema-cli&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=WhereJuly_65-env-schema-cli)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=WhereJuly_65-env-schema-cli&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=WhereJuly_65-env-schema-cli)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=WhereJuly_65-env-schema-cli&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=WhereJuly_65-env-schema-cli)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=WhereJuly_65-env-schema-cli&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=WhereJuly_65-env-schema-cli)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=WhereJuly_65-env-schema-cli&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=WhereJuly_65-env-schema-cli)

---

Contents

- [Usage](#usage)
- [Programmatic Usage](#programmatic-usage)
- [Maintenance](#maintenance)
  - [Contributions](#contributions)
  - [License](#license)

---

## Usage

## Programmatic Usage

Note the package isolates operations from any actual `process.env` and it does not change the latter. It reads the source env file(s) variables into and write the destination env variables out to internal objects and operates on them.

The `.run(envFile: string)` method returns [`TRunReturns`](src/core/EnvSchemaCore.service.ts) object or throws the exception that indicates invalid variables.

## Maintenance

The package is written in TypeScript with the informative JSDoc blocks available on hover for public interface (e.g. in VS Code) for comfortable programmatic usage. The code is carefully crafted with TDD allowing simple extension. The project is production-ready and actively maintained.

### Contributions

Potentially valuable use cases / functionality suggestions as well as usage questions are welcome in [Discussions](https://github.com/WhereJuly/65-env-schema-cli/discussions).

If there is a [pull request](https://github.com/WhereJuly/65-env-schema-cli/pulls), I would receive it on `integration` branch for discussion and manual merge.

### License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
