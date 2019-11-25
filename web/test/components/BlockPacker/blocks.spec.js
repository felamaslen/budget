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
    t.is(div.childNodes.length, 2);
});

test('<Blocks /> - list of blocks', (t) => {
    const { container } = getBlocks();

    const [div] = container.childNodes;
    const [group0, group1] = div.childNodes;

    t.is(group0.tagName, 'DIV');
    t.is(group0.childNodes.length, 2);

    t.is(group1.tagName, 'DIV');
    t.is(group1.childNodes.length, 1);
});
