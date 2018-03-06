import { Map as map, List } from 'immutable';
import { expect } from 'chai';
import React from 'react';
import shallow from '../../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import Blocks from '../../../../src/containers/page/analysis/blocks';
import BlockPacker from '../../../../src/components/block-packer';
import {
    ANALYSIS_BLOCK_CLICKED, CONTENT_BLOCK_HOVERED
} from '../../../../src/constants/actions';

describe('Analysis page <Blocks />', () => {
    const state = map({
        other: map({
            blockView: map({
                active: [0, 1],
                blocks: List.of({ foo: 'bar' }),
                deep: 'baz deepblock',
                status: 'foo status'
            })
        })
    });

    const store = createMockStore(state);

    const wrapper = shallow(<Blocks />, store).dive();

    it('should render its basic structure', () => {
        expect(wrapper.is(BlockPacker)).to.equal(true);
        expect(wrapper.props()).to.deep.include({
            page: 'analysis',
            activeBlock: [0, 1],
            blocks: List.of({ foo: 'bar' }),
            deep: 'baz deepblock',
            status: 'foo status'
        });
    });

    it('should dispatch block clicked action on click', () => {
        expect(store.isActionDispatched({ type: ANALYSIS_BLOCK_CLICKED, req: 'res' })).to.equal(false);

        wrapper.props().onClick({ req: 'res' });

        expect(store.isActionDispatched({ type: ANALYSIS_BLOCK_CLICKED, req: 'res' })).to.equal(true);
    });

    it('should dispatch block hovered action on hover', () => {
        expect(store.isActionDispatched({ type: CONTENT_BLOCK_HOVERED, block: 'foo', subBlock: 'bar' })).to.equal(false);

        wrapper.props().onHover('foo', 'bar');

        expect(store.isActionDispatched({ type: CONTENT_BLOCK_HOVERED, block: 'foo', subBlock: 'bar' })).to.equal(true);
    });
});

