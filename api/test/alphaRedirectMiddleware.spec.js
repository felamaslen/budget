/**
 * Specification for alpha-api backwards compatibility
 */

require('dotenv').config();
const expect = require('chai').expect;

const alpha = require('../src/alphaRedirectMiddleware');

describe('Redirect middleware', () => {
    describe('getNewTaskFromOld', () => {
        it('should redirect authentication', () => {
            expect(alpha.getNewTaskFromOld('login')).to.equal('user/login');
        });
        it('should not modify unhandled tasks', () => {
            expect(alpha.getNewTaskFromOld('foo/bar/baz')).to.equal('foo/bar/baz');
        });
    });
});

