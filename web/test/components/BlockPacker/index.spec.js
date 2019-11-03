import ava from 'ava';
import ninos from 'ninos';

import '~client-test/browser';
import memoize from 'fast-memoize';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import BlockPacker from '~client/components/BlockPacker';

const test = ninos(ava);

const getBlockPacker = memoize((customProps = {}) => {
    const props = {
        blocks: [
            {
                width: 10.4,
                height: 11.5,
                bits: [
                    {
                        name: 'foo',
                        value: 5.1,
                        color: 'black',
                        width: 8,
                        height: 9.3,
                        blocks: [
                            {
                                width: 4.9,
                                height: 9.21,
                                bits: [
                                    {
                                        name: 'foo1',
                                        value: 3,
                                        color: 'teal',
                                        width: 3,
                                        height: 3.1,
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        name: 'bar',
                        value: 5.2,
                        color: 'red',
                        blocks: [
                            {
                                bits: [
                                    {
                                        name: 'bar1',
                                        value: 4,
                                        color: 'teal',
                                        width: 3,
                                        height: 3.1,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
        activeMain: 'not_foo',
        activeSub: 'not_bar',
        deepBlock: 'foo',
        status: 'bar',
        onClick: () => null,
        onHover: () => null,
        ...customProps,
    };

    return render(<BlockPacker {...props} />);
});

test('basic structure', (t) => {
    const { container } = getBlockPacker();

    t.is(container.tagName, 'DIV');
    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.childNodes.length, 2);
});

test('outer block tree', (t) => {
    const { container } = getBlockPacker();
    const [div] = container.childNodes;
    const [blockTreeOuter] = div.childNodes;

    t.is(blockTreeOuter.tagName, 'DIV');
});

test('status bar', (t) => {
    const { container } = getBlockPacker();
    const [div] = container.childNodes;
    const [, statusBarOuter] = div.childNodes;

    t.is(statusBarOuter.tagName, 'DIV');
    t.is(statusBarOuter.childNodes.length, 1);
    t.is(statusBarOuter.innerHTML, 'bar');
});

test('blocks', (t) => {
    const { container } = getBlockPacker();
    const [div] = container.childNodes;
    const [blockTreeOuter] = div.childNodes;

    t.is(blockTreeOuter.childNodes.length, 1);
});

test('running onHover, with null values on mouseout / touchend', (t) => {
    const onHover = t.context.stub();
    const { container } = getBlockPacker({ onHover });

    const [div] = container.childNodes;

    t.deepEqual(onHover.calls, []);
    fireEvent.mouseOut(div);

    t.is(onHover.calls.length, 1);
    t.deepEqual(onHover.calls[0].arguments, [null, null]);
});

test('not rendering blocks if blocks is null', (t) => {
    const { container } = getBlockPacker({ blocks: null });
    const [div] = container.childNodes;
    const [blocks] = div.childNodes;

    t.is(blocks.childNodes.length, 0);
});
