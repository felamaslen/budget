/* eslint-disable no-unused-expressions */
import test from 'ava';
import sinon from 'sinon';
import '~client-test/browser';
import { render, fireEvent } from '@testing-library/react';
import memoize from 'fast-memoize';
import React from 'react';
import BlockBits, { BlockGroup, SubBlock } from '~client/components/BlockPacker/block-bits';

const getSubBlock = memoize((customProps = {}) => {
    const props = {
        name: 'foo',
        value: 101.5,
        subBlockBit: {
            name: 'bar',
            color: 'red',
            value: 53.24,
            width: 90,
            height: 87,
        },
        activeMain: null,
        activeSub: null,
        onHover: () => null,
        ...customProps,
    };

    return render(<SubBlock {...props} />);
});

test('<SubBlock /> - rendering basic structure', (t) => {
    const { container } = getSubBlock();

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.style.width, '90px');
    t.is(div.style.height, '87px');
});

test('<SubBlock /> - onHover', (t) => {
    const onHover = sinon.spy();

    const { container } = getSubBlock({
        onHover,
    });

    t.is(onHover.getCalls().length, 0);
    fireEvent.mouseOver(container.childNodes[0]);
    t.is(onHover.getCalls().length, 1);
    t.deepEqual(onHover.getCalls()[0].args, ['foo', 'bar']);
});

const getBlockGroup = memoize((customProps = {}) => {
    const props = {
        name: 'foo',
        value: 987,
        activeSub: null,
        onHover: () => null,
        subBlock: {
            bits: [
                {
                    name: 'foo', color: 'red', value: 3, width: 1, height: 1,
                },
                {
                    name: 'bar', color: 'green', value: 5, width: 1, height: 1,
                },
            ],
            width: 15,
            height: 13,
        },
        ...customProps,
    };

    return render(<BlockGroup {...props} />);
});

test('<BlockGroup /> - rendering basic structure', (t) => {
    const { container } = getBlockGroup();

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.style.width, '15px');
    t.is(div.style.height, '13px');

    t.is(div.childNodes.length, 2);
});

const getBlockBits = memoize((customProps = {}) => {
    const props = {
        blockBit: {
            name: 'foo',
            value: 1001.3,
            color: 'red',
            blocks: [
                {
                    bits: [
                        {
                            name: 'foo', color: 'pink', value: 3, width: 1, height: 1,
                        },
                        {
                            name: 'bar', color: 'turquoise', value: 5, width: 1, height: 1,
                        },
                    ],
                    width: 15,
                    height: 13,
                },
            ],
            width: 21,
            height: 13,
        },
        page: 'page1',
        activeMain: null,
        activeSub: null,
        onHover: () => null,
        onClick: () => null,
        ...customProps,
    };

    return render(<BlockBits {...props} />);
});

test('<BlockBits /> - rendering basic structure', (t) => {
    const { container } = getBlockBits();

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.childNodes.length, 1);
});

test('<BlockBits /> - rendering a list of blocks', (t) => {
    const { container } = getBlockBits();

    const [div] = container.childNodes;
    const [group] = div.childNodes;

    t.is(group.tagName, 'DIV');

    t.is(group.childNodes.length, 2);

    const [bit0, bit1] = group.childNodes;

    t.is(bit0.tagName, 'DIV');
    t.is(bit1.tagName, 'DIV');
});

test('<BlockBits /> - skipping subBlock render if there are none', (t) => {
    const { container } = getBlockBits({
        blockBit: {
            name: 'foo',
            value: 1001.3,
            color: 'red',
            width: 21,
            height: 13,
        },
    });

    const [div] = container.childNodes;

    t.is(div.childNodes.length, 0);
});
