import { fromJS } from 'immutable';
import { expect } from 'chai';

import * as S from '../../src/sagas';

describe('sagas.index', () => {
    describe('selectApiKey', () => {
        it('should get the API key from the state', () => {
            expect(S.selectApiKey(fromJS({
                user: {
                    apiKey: 'foo'
                }
            }))).to.equal('foo');
        });
    });
});

