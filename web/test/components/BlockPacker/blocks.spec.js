import test from 'ava';
import '~client-test/browser';
import memoize from 'fast-memoize';
import { render } from '@testing-library/react';
import React from 'react';
import Blocks, { OuterBlockGroup } from '~client/components/BlockPacker/blocks';

const getOuterBlockGroup = memoize((customProps = {}) => {
    const props = {
        page: 'page1',
        block: {
            width: 10.4,
            height: 11.5,
            bits: [
                {
                    name: 'foo',
                    value: 5.1,
                    color: 'black',
                    width: 3,
                    height: 3,
                    blocks: [
                        {
                            width: 2.9,
                            height: 2.15,
                            bits: [
                                {
                                    name: 'foo1', value: 3, color: 'ebony', width: 3, height: 2.9,
                                },
                            ],
                        },
                    ],
                },
                {
                    name: 'bar',
                    value: 5.2,
                    color: 'red',
                    width: 4,
                    height: 2.4,
                    blocks: [
                        {
                            width: 2.8,
                            height: 4.35,
                            bits: [
                                {
                                    name: 'bar1', value: 4, color: 'pink', width: 2, height: 1.3,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        activeMain: 'not_foo',
        activeSub: 'not_bar',
        onHover: () => null,
        onClick: () => null,
        ...customProps,
    };

    return render(<OuterBlockGroup {...props} />);
});

test('<OuterBlockGroup /> - rendering basic structure', (t) => {
    const { container } = getOuterBlockGroup();

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.className, 'block-group');
});

test('<OuterBlockGroup /> - rendering width an height', (t) => {
    const { container } = getOuterBlockGroup();
    const [div] = container.childNodes;

    t.is(div.style.width, '10.4px');
    t.is(div.style.height, '11.5px');
});

test('<OuterBlockGroup /> - rendering the block\'s bits', (t) => {
    const { container } = getOuterBlockGroup();
    const [div] = container.childNodes;

    t.is(div.childNodes.length, 2);

    const [bits0, bits1] = div.childNodes;

    t.is(bits0.tagName, 'DIV');
    t.is(bits1.tagName, 'DIV');

    t.is(bits0.className, 'block block-black block-foo');
    t.is(bits1.className, 'block block-red block-bar');
});

const getBlocks = (customProps = {}) => {
    const props = {
        blocks: [
            {
                width: 10,
                height: 10,
                bits: [
                    {
                        name: 'foo',
                        color: 'teal',
                        value: 8,
                        blocks: [
                            {
                                width: 8,
                                height: 7.3,
                                bits: [
                                    {
                                        name: 'foo1',
                                        value: 8,
                                        color: 'ebony',
                                        width: 3,
                                        height: 2.9,
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        name: 'bar',
                        color: 'cyan',
                        value: 2,
                        blocks: [
                            {
                                width: 1,
                                height: 9.3,
                                bits: [
                                    {
                                        name: 'bar1',
                                        value: 2,
                                        color: 'ebony',
                                        width: 3,
                                        height: 2.9,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                width: 3,
                height: 7,
                bits: [
                    {
                        name: 'baz',
                        color: 'orange',
                        value: 5,
                        blocks: [],
                    },
                ],
            },
        ],
        activeMain: null,
        activeSub: null,
        page: 'page1',
        onClick: () => null,
        onHover: () => null,
        ...customProps,
    };

    return render(<Blocks {...props} />);
};

test('<Blocks /> - basic structure', (t) => {
    const { container } = getBlocks();

    t.is(container.tagName, 'DIV');
    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.className, 'block-tree');
    t.is(div.childNodes.length, 2);
});

test('<Blocks /> - list of blocks', (t) => {
    const { container } = getBlocks();

    const [div] = container.childNodes;
    const [group0, group1] = div.childNodes;

    t.is(group0.tagName, 'DIV');
    t.is(group0.className, 'block-group');
    t.is(group0.childNodes.length, 2);

    t.is(group1.tagName, 'DIV');
    t.is(group1.className, 'block-group');
    t.is(group1.childNodes.length, 1);
});

test('<Blocks /> - active main block', (t) => {
    const { container } = getBlocks({
        activeMain: 'foo',
    });

    const [div] = container.childNodes;
    const [groupFoz, groupBoz] = div.childNodes;

    const [bitFoo, bitBar] = groupFoz.childNodes;
    const [bitBaz] = groupBoz.childNodes;

    t.is(bitFoo.className, 'block block-teal active block-foo');
    t.is(bitBar.className, 'block block-cyan block-bar');

    t.is(bitBaz.className, 'block block-orange block-baz');
});

test('<Blocks /> - active sub block', (t) => {
    const { container } = getBlocks({
        activeMain: 'bar',
        activeSub: 'bar1',
    });

    const [div] = container.childNodes;
    const [groupFoz] = div.childNodes;

    const [bitFoo, bitBar] = groupFoz.childNodes;

    const [groupFoo] = bitFoo.childNodes;
    const [groupBar] = bitBar.childNodes;

    const [bitFoo1] = groupFoo.childNodes;
    const [bitBar1] = groupBar.childNodes;

    t.is(bitFoo1.className, 'sub-block');
    t.is(bitBar1.className, 'sub-block active');
});

test('<Blocks /> - deep prop', (t) => {
    const { container } = getBlocks({
        deepBlock: 'foo',
    });

    const [div] = container.childNodes;

    t.is(div.className, 'block-tree block-tree-deep block-tree-foo');
});
