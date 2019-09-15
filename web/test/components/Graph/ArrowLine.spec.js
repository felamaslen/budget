import test from 'ava';
import memoize from 'fast-memoize';
import '~client-test/browser';
import { render } from '@testing-library/react';
import React from 'react';
import ArrowLine from '~client/components/Graph/ArrowLine';

const points = [
    [0, 5],
    [1, 4.5],
    [2, 2.3],
    [3, -1.2],
];

const getContainer = memoize(() => {
    const props = {
        data: points,
        color: 'black',
        minY: -5,
        maxY: 10,
        pixX: (xv) => xv * 5 + 1,
        pixY: (yv) => yv * 10 + 2,
    };

    return render(<svg>
        <ArrowLine {...props} />
    </svg>);
});

test('rendering a list of arrow SVG paths', (t) => {
    const { container } = getContainer();
    t.is(container.childNodes.length, 1);
    const [svg] = container.childNodes;
    t.is(svg.childNodes.length, 1);
    const [g] = svg.childNodes;

    t.is(g.tagName, 'g');
    t.is(g.childNodes.length, points.length);
});

test('rendering paths as Arrow components', (t) => {
    t.plan(points.length * 2);

    const { container } = getContainer();
    const [svg] = container.childNodes;
    const [g] = svg.childNodes;

    points.forEach((point, index) => {
        const child = g.childNodes[index];
        t.is(child.tagName, 'g');

        const [path] = child.childNodes;
        t.is(path.tagName, 'path');
    });
});
