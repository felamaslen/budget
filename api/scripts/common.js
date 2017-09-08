function logger(message, key = 'MSG') {
    console.log(`[${key}@${new Date()}]`, message);
}

module.exports = {
    logger
};

