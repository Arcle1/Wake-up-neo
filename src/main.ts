import { Argument } from './types'
import { parse_defaults } from './parser'

/**
 * Function runs default parse process
 * @function install
 * @param {string} help Help page of linter
 * @param {string} linter Linter name
 * @param {string} delimiter Arguments delimiters. `=` is default
 * @param {boolean} argumentPath Whether path passed as last no-named argument or not. `true` is default.
 * @returns {string} Json representation of help page
 */
export function run (help: String, linter: String, delimiters: String = '=', argumentPath: boolean = true) : String {
    const options = parse_defaults(help);
    const result = {
        "$schema": "https://repometric.github.io/linterhub/schema/args.json",
        "name": linter,
        "type": "object",
        "allOf": [
            {
                "$ref": "#/definitions/arguments"
            }
        ],
        "delimeters": delimiters,
        "definitions": {
            "arguments": {
                "type": "object",
                "properties": {}
            },
            "section": {
                "type": "object",
                "description": "The engine configuration section",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "The engine name",
                        "enum": [
                            linter
                        ]
                    },
                    "options": {
                        "type": "object",
                        "description": "The engine configuration",
                        "$ref": "#/definitions/arguments"
                    }
                }
            }
        }
    };
    // TODO
    if (argumentPath) {
        const arg: Argument = {
            id: "linterhub:path",
            type: "string",
            description: "Path for analysis"
        };
        result.definitions.arguments.properties[""] = arg;
    }
    options.forEach(option => {
        const argumentName = option[1];
        let argument: Argument = {} as any;
        switch(argumentName){
            case '--help':
                argument = {
                    id: "linterhub:help",
                    type: "null",
                    description: "Show help message"
                };
                break;
            case '--version':
                argument = {
                    id: "linterhub:version",
                    type: "string",
                    description: "Show version"
                };
                break;
            default:
                argument = {
                    id: (option[2] === 1 ? "args:" : "") + option[1],
                    //TODO argument types
                    type: "string",
                    description: option[4],
                    default: option[3] ? option[3] : null
                };
        }
        result.definitions.arguments.properties[argumentName] = argument;
    });

    return JSON.stringify(result, null, 4)
}