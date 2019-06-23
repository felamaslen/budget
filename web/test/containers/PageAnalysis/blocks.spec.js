import test from 'ava';
import '~client-test/browser';
import { Map as map, List as list } from 'immutable';
import { render, fireEvent } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import Blocks from '~client/containers/PageAnalysis/blocks';
import { aBlockClicked } from '~client/actions/analysis.actions';
import { aContentBlockHovered } from '~client/actions/content.actions';

const getContainer = (customProps = {}, customState = null) => {
    let state = map({
        other: map({
            blockView: map({
                active: [0, 1],
                blocks: list.of(
                    map({
                        name: 'foo',
                        value: 10,
                        width: 90,
                        height: 87,
                        bits: list.of(
                            map({
                                name: 'bar',
                                value: 3,
                                color: 'red',
                                width: 27,
                                height: 87,
                                blocks: list.of(
                                    map({
                                        bits: list.of(
                                            map({
                                                name: 'bak',
                                                value: 3,
                                                width: 27,
                                                height: 87
                                            })
                                        )
                                    })
                                )
                            }),
                            map({
                                name: 'baz',
                                value: 7,
                                color: 'blue',
                                width: 63,
                                height: 87,
                                blocks: list.of()
                            })
                        )
                    })
                ),
                deep: 'baz deepblock',
                status: 'foo status'
            })
        })
    });

    if (customState) {
        state = customState(state);
    }

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
        block: map({ name: 'bar', value: 3 }),
        subBlock: map({ name: 'bak', value: 3, width: 27, height: 87 })
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
