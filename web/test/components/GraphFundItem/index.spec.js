import test from 'ava';
import memoize from 'fast-memoize';
import { render } from '@testing-library/react';
import '~client-test/browser';
import React from 'react';
import GraphFundItem from '~client/components/GraphFundItem';

const getGraph = memoize((customProps = {}) => {
    const props = {
        id: '3',
        name: 'some-fund-graph',
        values: [
            [100, 42.3],
            [101, 41.2],
            [102, 45.9],
            [102.5, 46.9],
            [103, 0],
            [104, 47.1],
            [105, 46.9],
            [106, 42.5]
        ],
        sold: false,
        popout: true,
        onToggle: () => null,
        ...customProps
    };

    return render(<GraphFundItem {...props} />);
});

test('rendering a graph with the correct paths', t => {
    const { container } = getGraph();
    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.childNodes.length, 1);

    const [svg] = div.childNodes;
    t.is(svg.tagName, 'svg');
    t.is(svg.className, 'popout');
});

test('not rendering anything if there are no values', t => {
    const { container } = getGraph({
        values: null
    });

    t.is(container.childNodes.length, 0);
});
