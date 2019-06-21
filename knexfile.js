function parseConnectionURI(uri = '') {
    const matches = uri.match(/^postgres(ql)?:\/\/(\w+):(\w+)@([\w-]+(\.[\w-]+)*)(:([0-9]+))?\/(\w+)$/);

    if (!matches) {
        throw new Error('invalid database string');
    }

    const [, , user, password, host, , , port, database] = matches;

    return {
        user,
        password,
        host,
        port,
        database
    };
}

module.exports = {
    client: 'pg',
    connection: parseConnectionURI(process.env.DATABASE_URL)
};
