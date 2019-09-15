import test from 'ava';
import { render } from '@testing-library/react';
import '~client-test/browser';
import React from 'react';
import Graph from '~client/components/Graph';

const getGraph = (customProps = {}) => {
    const props = {
        name: 'foo',
        width: 200,
        height: 100,
        padding: [10, 10, 10, 10],
        svgClasses: 'svgClass1 svgClass2',
        ...customProps,
    };

    return render(
        <Graph {...props}>
            <span>{'foo'}</span>
        </Graph>,
    );
};

test('rendering a basic container', (t) => {
    const { container } = getGraph();
    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.childNodes.length, 1);
    t.is(div.className, 'graph-container graph-foo');
});

test('rendering an SVG with a custom class', (t) => {
    const { container } = getGraph();
    const [div] = container.childNodes;
    t.is(div.childNodes.length, 1);

    const [svg] = div.childNodes;
    t.is(svg.tagName, 'svg');
    t.is(svg.className, 'svgClass1 svgClass2');
});

test('rendering its children inside the SVG', (t) => {
    const { container } = getGraph();
    const [div] = container.childNodes;
    const [svg] = div.childNodes;

    t.is(svg.childNodes.length, 1);
    const [span] = svg.childNodes;

    t.is(span.tagName, 'span');
    t.is(span.innerHTML, 'foo');
});

test('accepting a child before the SVG', (t) => {
    const Before = () => <span>{'before1'}</span>;

    const { container } = getGraph({
        before: Before,
    });
    const [div] = container.childNodes;

    t.is(div.childNodes.length, 2);

    const [before, svg] = div.childNodes;

    t.is(svg.tagName, 'svg');
    t.is(before.tagName, 'SPAN');
    t.is(before.innerHTML, 'before1');
});

test('accepting a child after the SVG', (t) => {
    const After = () => <span>{'after1'}</span>;

    const { container } = getGraph({
        after: After,
    });
    const [div] = container.childNodes;

    t.is(div.childNodes.length, 2);

    const [svg, after] = div.childNodes;

    t.is(svg.tagName, 'svg');
    t.is(after.tagName, 'SPAN');
    t.is(after.innerHTML, 'after1');
});

test('accepting children before and after the SVG', (t) => {
    const Before = () => <span>{'before1'}</span>;
    const After = () => <span>{'after1'}</span>;

    const { container } = getGraph({
        before: Before,
        after: After,
    });
    const [div] = container.childNodes;

    t.is(div.childNodes.length, 3);

    const [before, svg, after] = div.childNodes;

    t.is(svg.tagName, 'svg');

    t.is(before.tagName, 'SPAN');
    t.is(before.innerHTML, 'before1');

    t.is(after.tagName, 'SPAN');
    t.is(after.innerHTML, 'after1');
});
