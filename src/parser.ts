export function parse_defaults(doc: String) {
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
