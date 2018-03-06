const prompt = require('prompt');

function promptUser(schema) {
    return new Promise((resolve, reject) => {
        prompt.start();

        prompt.get(schema, (err, result) => {
            if (err) {
                return reject(err);
            }

            return resolve(result);
        });
    });
}

function removeWhitespace(data) {
    return data
        .replace(/\n/g, '')
        .replace(/\r/g, '')
        .replace(/\t/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s+>/g, '>');
}

const localFile = file => `file://${file}`;

module.exports = {
    promptUser,
    removeWhitespace,
    localFile
};

