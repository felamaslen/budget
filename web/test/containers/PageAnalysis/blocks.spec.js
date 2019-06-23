import test from 'ava';
import '~client-test/browser';
import { render, fireEvent } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import Blocks from '~client/containers/PageAnalysis/blocks';
import { aBlockClicked } from '~client/actions/analysis.actions';
import { aContentBlockHovered } from '~client/actions/content.actions';

const getContainer = (customProps = {}, customState = state => state) => {
    const state = customState({
        other: {
            blockView: {
                active: ['foo', 'foz'],
                blocks: [
                    {
                        width: 90,
                        height: 87,
                        bits: [
                            {
                                name: 'bar',
                                value: 3,
                                color: 'red',
                                width: 27,
                                height: 87,
                                blocks: [
                                    {
                                        width: 20,
                                        height: 39,
                                        bits: [
                                            {
                                                name: 'bak',
                                                value: 3,
                                                color: 'pink',
                                                width: 27,
                                                height: 87
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: 'baz',
                                value: 7,
                                color: 'blue',
                                width: 63,
                                height: 87,
                                blocks: []
                            }
                        ]
                    }
                ],
                deep: 'baz deepblock',
                status: 'foo status'
            }
        }
    });

    const store = createMockStore(state);

    const props = {
        ...customProps
    };

    const utils = render(
        <Provider store={store}>
            <Blocks {...props} />
        </Provider>
    );

    return { store, ...utils };
};

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.className, 'block-view');
});

test('dispatching block clicked actions', t => {
    const { store, container } = getContainer();
    const action = aBlockClicked({
        wasDeep: true,
        page: 'analysis',
        name: 'bar'
    });

    t.false(store.isActionDispatched(action));

    const [div] = container.childNodes;

    const [blockTreeOuter] = div.childNodes;
    const [blockTree] = blockTreeOuter.childNodes;
    const [blockGroup] = blockTree.childNodes;
    const [block] = blockGroup.childNodes;

    t.is(block.className, 'block block-red');

    fireEvent.click(block);
    t.true(store.isActionDispatched(action));
});

test('dispatching block hover actions', t => {
    const { store, container } = getContainer();
    const action = aContentBlockHovered({
        block: { name: 'bar', value: 3 },
        subBlock: { name: 'bak', color: 'pink', value: 3, width: 27, height: 87 }
    });

    t.false(store.isActionDispatched(action));

    const [div] = container.childNodes;

    const [blockTreeOuter] = div.childNodes;
    const [blockTree] = blockTreeOuter.childNodes;
    const [blockGroup] = blockTree.childNodes;
    const [block] = blockGroup.childNodes;
    const [subBlockGroup] = block.childNodes;
    const [subBlock] = subBlockGroup.childNodes;

    fireEvent.mouseOver(subBlock);
    t.true(store.isActionDispatched(action));
});
