/**
 * Spec for database methods
 */

/* eslint no-unused-expressions: 0 */
require('dotenv').config();

const expect = require('chai').expect;

const common = require('./common');
const Database = require('../src/db');

describe('Database', () => {
    describe('parseConnectionURI', () => {
        it('should get database information from a database URI', () => {
            const info = Database.parseConnectionURI('mysql://user:password@host.com:1234/database');

            expect(info.user).to.equal('user');
            expect(info.password).to.equal('password');
            expect(info.host).to.equal('host.com');
            expect(info.port).to.equal(1234);
            expect(info.database).to.equal('database');
        });
    });

    describe('dbMiddleware', () => {
        let req = null;
        before(() => {
            req = new common.Req();
        });

        it('should connect to the database and add the connection to the request', async () => {
            const res = new common.Res();

            await Database.dbMiddleware(req, res, () => null);

            expect(req.db).to.be.an.instanceOf(Database.Connection);
            expect(req.db.conn).to.be.ok;
        });

        after(async () => {
            await req.db.end();
        });
    });
});
