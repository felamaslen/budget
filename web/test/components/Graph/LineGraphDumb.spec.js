import test from 'ava';
import { render } from 'react-testing-library';
import { fromJS } from 'immutable';
import '~client-test/browser';
import React from 'react';
import LineGraphDumb from '~client/components/Graph/LineGraphDumb';

test('rendering a line graph', t => {
    const props = {
        width: 200,
        height: 100,
        lines: fromJS([
            {
                key: 'line1',
                data: [
                    [100, 1],
                    [101, 2],
                    [102, -1],
                    [103, 0]
                ],
                smooth: false,
                color: 'black'
            },
            {
                key: 'line2',
                data: [
                    [100, 1],
                    [101, 2],
                    [102, -1],
                    [103, 0]
                ],
                smooth: true,
                color: 'black',
                strokeWidth: 1.5
            },
            {
                key: 'line3',
                data: [
                    [100, 1]
                ],
                smooth: false,
                color: 'black'
            },
            {
                key: 'line4',
                data: [
                    [100, 1]
                ],
                smooth: false,
                color: 'black'
            },
            {
                key: 'line5',
                data: [
                    [100, 1],
                    [102, 2]
                ],
                smooth: true,
                color: 'black'
            }
        ]),
        calc: {
            minX: 100,
            maxX: 103,
            minY: -2,
            maxY: 2,
            pixX: () => 0,
            pixY: () => 0,
            valX: () => 0,
            valY: () => 0
        }
    };

    const { container } = render(<LineGraphDumb {...props} />);

    t.is(container.childNodes.length, 1);
    const [graph] = container.childNodes;

    t.is(graph.tagName, 'DIV');
    t.is(graph.childNodes.length, 1);

    const [svg] = graph.childNodes;
    t.is(svg.tagName, 'svg');
});


