let fs = require('fs');

//require( path.resolve( __dirname, "./functions.js" ));

let doc =
    "Options:\n" +
    "  --names=NAMES                      A comma-separated list of file names to check [default: [\"*.php\"]]\n" +
    "  --names-exclude=NAMES-EXCLUDE      A comma-separated list of file names to exclude\n" +
    "  --regexps-exclude=REGEXPS-EXCLUDE  A comma-separated list of paths regexps to exclude (example: \"#var/.*_tmp#\")\n" +
    "  --exclude=EXCLUDE                  Exclude a directory from code analysis (must be relative to source) (multiple values allowed)\n" +
    "  --log-pmd=LOG-PMD                  Write result in PMD-CPD XML format to file\n" +
    "  --min-lines=MIN-LINES              Minimum number of identical lines [default: 5]\n" +
    "  --min-tokens=MIN-TOKENS            Minimum number of identical tokens [default: 70]\n" +
    "  --fuzzy                            Fuzz variable names\n" +
    "  --progress                         Show progress bar\n" +
    " -h, --help                             Display this help message\n" +
    " -q, --quiet                            Do not output any message\n" +
    " -V, --version                          Display this application version\n" +
    "  --ansi                             Force ANSI output\n" +
    "  --no-ansi                          Disable ANSI output\n" +
    " -n, --no-interaction                   Do not ask any interactive question\n" +
    " -v|vv|vvv, --verbose                   Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug";

linter_name = "linter1";
//FIXME delimiters parsing
delimiters = "=";
//FIXME command-line arguments parsing
arg_path = true;

options = handle(doc);

generateJSON(options, linter_name, delimiters, arg_path);

function generateJSON (options, linter_name, delimiters, arg_path) {
    let result = {
        "$schema": "https://repometric.github.io/linterhub/schema/args.json",
        "name": linter_name,
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
                            linter_name
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
    if (arg_path) {
        let arg = {};
        arg.id = "linterhub:path";
        arg.type = "string";
        arg.description = "Path for analysis";
        result.definitions.arguments.properties[""] = arg;
    }
    options.forEach(function (option) {
        if (option[1] === "--help") {
            let arg = {};
            arg.type = "null";
            arg.description = "Show help message";
            result.definitions.arguments.properties["--help"] = arg;
        } else if (option[1] === "--version") {
            let arg = {};
            arg.id = "linterhub:version";
            arg.type = "null";
            arg.description = "Show version";
            result.definitions.arguments.properties["--version"] = arg;
        } else {
            let arg = {};
            if (option[2] === 1) {
                // arg.short-version = option[0];
                arg.id = "args:" + option[1];
            } else {
                arg.id = option[1];
            }
            //FIXME argument types
            arg.type = "string";
            arg.description = option[4];
            if (option[3]) {
                arg.default = option[3];
            }
            let name = option[1];
            result.definitions.arguments.properties[name] = arg;
        }
    });

    fs.writeFile('test.json', JSON.stringify(result, null, 4), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
}


function handle(doc) {
    try {
        let options;
        options = parse_defaults(doc);
        return options;
    } catch (__e__) {
        throw __e__;
    }
}

function parse_defaults(doc) {
    let options = [];
    parse_section("Options:", doc).forEach(function(s) {
        let tmp = s.split(/options:\n/i, 2);
        s = "\n" + tmp[1];
        let splitTmp = (s.split(/\n[ \t]*(-\S+?)/)).slice(1);
        let split = [];
        for (let cnt = splitTmp.length, i = 0; i < cnt; i+=2) {
            if (splitTmp !== undefined) {
                split.push(splitTmp[i] + splitTmp[
                    i + 1]);
            } else {
                split.push(splitTmp[i]);
            }
        }
        split.forEach(function(s) {
            if (s.indexOf("-") === 0) {
                options.push(parse(s))
            }
        });
    });
    return options;
}

function parse_section(name, source) {
    let ret = [];
    let re = new RegExp('[^\n]*' + name + '[^\n]*\n?(?:[ \t].*?(?:\n|$))*');
    let matches = source.match(re);
    matches.forEach(function (match) {
        ret.push(match.trim());
    });
    return ret;
}

function parse(optionDescription) {

    let short = null;
    let long = null;
    let argcount = 0;
    let value = false;
    let description;

    optionDescription = optionDescription.trim();
    let exp = optionDescription.split(/\s\s+/, 2);
    let options = exp[0];
    if (exp[1] !== undefined) {
        description = exp[1].trim();
    } else {
        description = "";
    }

    options = options.replace(/=/g, " ");
    options = options.replace(/,/g, " ");
    options = options.split(/\s+/);
    options.forEach(function (s) {
        let tmp = s.charAt(0);
        if (s.indexOf('--') === 0) {
            long = s;
        } else if (s !== undefined && tmp === "-") {
            short = s;
        } else {
            argcount = 1;
        }
    });

    if (argcount) {
        value = null;
        let match = description.match(/\[default: (.*?)\]/i);
        if (match) {
            value = match[1];
        }
    }
    return [short, long, argcount, value, description];
}
