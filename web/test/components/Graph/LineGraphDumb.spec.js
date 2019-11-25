import test from 'ava';
import { render } from '@testing-library/react';
import '~client-test/browser';
import React from 'react';
import LineGraphDumb from '~client/components/Graph/LineGraphDumb';

const getContainer = (customProps = {}) => {
    const props = {
        name: 'some-dumb-graph',
        dimensions: {
            width: 200,
            height: 100,
            padding: [10, 0, 3, 5],
            minX: 0,
            maxX: 10,
            minY: -3,
            maxY: 7,
        },
        outerProperties: {},
        svgProperties: {},
        lines: [
            {
                key: 'line1',
                data: [[100, 1], [101, 2], [102, -1], [103, 0]],
                smooth: false,
                color: 'black',
            },
            {
                key: 'line2',
                data: [[100, 1], [101, 2], [102, -1], [103, 0]],
                smooth: true,
                color: 'black',
                strokeWidth: 1.5,
            },
            {
                key: 'line3',
                data: [[100, 1]],
                smooth: false,
                color: 'black',
            },
            {
                key: 'line4',
                data: [[100, 1]],
                smooth: false,
                color: 'black',
            },
            {
                key: 'line5',
                data: [[100, 1], [102, 2]],
                smooth: true,
                color: 'black',
            },
        ],
        calc: {
            minX: 100,
            maxX: 103,
            minY: -2,
            maxY: 2,
            pixX: () => 0,
            pixY: () => 0,
            valX: () => 0,
            valY: () => 0,
        },
        ...customProps,
    };

    return render(<LineGraphDumb {...props} />);
};

test('rendering a line graph', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [graph] = container.childNodes;

    t.is(graph.tagName, 'DIV');
    t.is(graph.childNodes.length, 1);

    const [svg] = graph.childNodes;
    t.is(svg.tagName, 'svg');
});

test('not rendering any SVG data if there are no lines', t => {
    const { container } = getContainer({ lines: [] });

    const {
        childNodes: [svg],
    } = container.childNodes[0];

    t.is(svg.childNodes.length, 0);
});

test('rendering lines', t => {
    const { container } = getContainer();

    const {
        childNodes: [svg],
    } = container.childNodes[0];

    t.is(svg.childNodes.length, 5);

    svg.childNodes.forEach(line => {
        t.is(line.tagName, 'g');
        t.is(line.childNodes.length, 1);

        const [path] = line.childNodes;

        t.is(path.tagName, 'path');
    });
});
