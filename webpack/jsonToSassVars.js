function jsonToSassVars(object) {
    // copied and modified from https://gist.github.com/Kasu/ea4f4861a81e626ea308
    const storedStrings = [];

    let sass = Object.keys(object)
        .map(key => `$${key}:${JSON.stringify(object[key], null, 4)};\n`)
        .join('')
        .replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, value => {
            const id = `___JTS${storedStrings.length}`;
            storedStrings.push({ id, value });

            return id;
        })
        .replace(/[{[]/g, '(')
        .replace(/[}\]]/g, ')');

    storedStrings.forEach(str => {
        sass = sass.replace(str.id, str.value);
    });

    return sass;
}

module.exports = jsonToSassVars;

