import test from 'ava';
import memoize from 'fast-memoize';
import '~client-test/browser';
import { List as list, Map as map } from 'immutable';
import { render } from 'react-testing-library';
import React from 'react';
import ListRowFundsDesktop from '~client/components/ListRowFundsDesktop';

const getContainer = memoize((customProps = {}) => {
    const props = {
        id: '10',
        row: map({
            cols: list(['foo-fund']),
            prices: list.of(
                list.of(1, 10),
                list.of(2, 11),
                list.of(3, 10.2)
            ),
            gain: map({
                value: 561932,
                gain: 0.3,
                gainAbs: 4030,
                dayGain: -0.02,
                dayGainAbs: -341,
                color: list([255, 128, 30])
            }),
            sold: false
        }),
        ...customProps
    };

    return render(<ListRowFundsDesktop {...props} />);
});

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [span] = container.childNodes;

    t.is(span.tagName, 'SPAN');
    t.is(span.childNodes.length, 2);
    t.is(span.className, 'fund-extra-info');
});

test('fund graph', t => {
    const { container } = getContainer();
    const [span] = container.childNodes;

    const [graph] = span.childNodes;

    t.is(graph.tagName, 'SPAN');
    t.is(graph.className, 'fund-graph');
    t.is(graph.childNodes.length, 1);

    const [graphCont] = graph.childNodes;
    t.is(graphCont.tagName, 'DIV');
    t.is(graphCont.childNodes.length, 1);
    t.is(graphCont.className, 'fund-graph-cont');

    const [graphItem] = graphCont.childNodes;

    t.is(graphItem.tagName, 'DIV');
    t.is(graphItem.className, 'graph-container graph-foo-fund');
});

test('gain info', t => {
    const { container } = getContainer();
    const [span] = container.childNodes;

    const [, gainInfo] = span.childNodes;

    t.is(gainInfo.tagName, 'SPAN');
    t.is(gainInfo.className, 'gain');
});
