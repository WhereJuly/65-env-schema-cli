'use strict';

import { OpenAPIV3_1 } from 'openapi-types';
import path from 'path';
import { readFile } from 'fs/promises';

import { accessSync, constants } from 'fs';
import OASDBCException from './OASDBCException.js';

type TActualRetrieveReturnType = Promise<string>;

/**
 * REFACTOR: On the dcoupld/oas package level it has to be available as the separate package
 * as it is used at least in 2 places. Here and in `utilities/markdown-merger` package.
 *  
 * Service for retrieving and parsing OpenAPI JSON definitions.
 * 
 * @group Core
 * @category Services
 */
export default class OASJSONDefinitionsRetrieveService {

    constructor() {
        this.retrieveFile = this.retrieveFile.bind(this);
    }

    /**
     * Retrieves and parses OpenAPI JSON definitions from a given source.
     * 
     * This method can handle both local file paths and URLs. It performs the following steps:
     * 1. Validates the source as either a URL or a file path.
     * 2. Retrieves the content from the source.
     * 3. Parses the content as JSON.
     * 4. Validates the parsed content as a valid OpenAPI v3.1.0 document.
     *
     * @param {string} source - The source of the OpenAPI JSON definitions.
     * Can be either a local file path (relative or absolute) with '.json' extension or a valid URL.
     * 
     * @throws {OASDBCException} Throws an exception if the source is neither a valid file 
     * path nor a URL, or if the content cannot be retrieved, parsed, or validated.
     * 
     * @returns {Promise<OpenAPIV3_1.Document>} A promise that resolves to the parsed and
     * validated OpenAPI document.
     */
    public async retrieve(source: string): Promise<OpenAPIV3_1.Document> {
        const isURL = this.isURL(source);
        const isMaybePath = path.normalize(source);

        if (!isURL && !isMaybePath) {
            throw new OASDBCException(`The source "${source}" must either be a local file path (relative or absolute path) with '.json' extension or a valid URL.`);
        }

        const concreteRetrieveMethod = this.getActualRetrieveMethod(isURL);
        const content = await concreteRetrieveMethod(source);

        const json = this.parseOrThrow(content);
        return this.getOASDefinitions(json);
    }

    /**
     * Retrieves the content of a JSON file from a local file system.
     * 
     * This method checks if the provided source is a valid local file path, converts it to an 
     * absolute path if necessary, and then reads the file content.
     * 
     * @param {string} source - The path to the JSON file. Can be either a relative or absolute path.
     * @throws {OASDBCException} Throws an exception if the source is not a valid local file path with '.json' extension.
     * @return {TActualRetrieveReturnType}
     */
    private async retrieveFile(source: string): TActualRetrieveReturnType {
        if (!this.isActualLocalFile(source)) {
            throw new OASDBCException(`The source "${source}" must be a local file path (relative or absolute path) with '.json' extension.`);
        }

        const absoluteFilePath = this.getAbsoluteFilePath(source);
        return await readFile(absoluteFilePath, 'utf-8');
    }

    /**
     * Retrieves the content of a JSON file from a given URL.
     * 
     * This method fetches the content from the provided URL and returns it as a string.
     * If there's an error during the fetch operation, it throws an OASDBCException.
     *
     * @param {string} url - The URL from which to retrieve the JSON content.
     * 
     * @throws {OASDBCException} Throws an exception if there's an error fetching the URL 
     * or if the response is not OK.
     * 
     * @returns {Promise<string>} A promise that resolves to the content of the URL as a string.
     */
    private async retrieveURL(url: string): TActualRetrieveReturnType {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new OASDBCException(`Unexpected response from the URL "${url}": ${response.statusText}.`);
            }

            return await response.text();
        } catch (_err) {
            throw new OASDBCException(`There was a network error fetching the URL "${url}".`, _err as Error);
        }
    }

    private isURL(url: string): boolean {
        return URL.canParse(url);
    }

    private isActualLocalFile(filePath: string): boolean {
        const absoluteFilePath = this.getAbsoluteFilePath(filePath);
        const isJSONExtension = path.extname(absoluteFilePath) === '.json';

        if (!isJSONExtension) {
            throw new OASDBCException(`The file "${filePath}" must have a '.json' extension.`);
        }

        this.checkFileExistsOrThrow(absoluteFilePath);

        return true;
    }

    private getAbsoluteFilePath(filePath: string): string {
        return path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
    }

    private checkFileExistsOrThrow(absoluteFilePath: string): true {
        try {
            accessSync(absoluteFilePath, constants.R_OK);
            return true;
        } catch (_err) {
            throw new OASDBCException(`The file "${absoluteFilePath}" does not exist.`);
        }
    }

    private getActualRetrieveMethod(isURL: boolean): (source: string) => TActualRetrieveReturnType {
        return isURL ? this.retrieveURL : this.retrieveFile; // NOSONAR
    }

    private parseOrThrow(content: string | Record<string, any>): OpenAPIV3_1.Document {
        const isObject = (value: unknown): value is object => { return typeof value === "object" && value !== null; };
        if (!this.isStringMaybeJSON(content) && !isObject(content)) {
            throw new OASDBCException('The given content is neither string nor object.');
        }

        try {
            return this.isStringMaybeJSON(content) ?
                (JSON.parse(content as string) as OpenAPIV3_1.Document) : content as OpenAPIV3_1.Document;
        } catch (_err) {
            const error = _err as Error;
            throw new OASDBCException('Could not parse the given content as JSON.', error);
        }
    }

    private getOASDefinitions(json: OpenAPIV3_1.Document): OpenAPIV3_1.Document {
        return json;
    }

    private isStringMaybeJSON(value: unknown): boolean {
        const isString = typeof value === 'string';
        return isString && value.length >= 2; // NB: Meaning '{}'|'[]' are the shortest valid JSON string. 
    }

}