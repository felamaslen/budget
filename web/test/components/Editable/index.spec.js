import test from 'ava';
import '~client-test/browser';
import { render } from 'react-testing-library';
import React from 'react';
import Editable from '~client/components/Editable';

const getContainer = (customProps = {}) => {
    const props = {
        onType: () => null,
        onChange: () => null,
        suggestions: {
            list: [],
            active: null,
            next: []
        },
        ...customProps
    };

    return render(<Editable {...props} />);
};

test('rendering active editable item', t => {
    const { container } = getContainer({
        active: true,
        item: 'shop',
        value: 'Tesco'
    });

    t.is(container.childNodes.length, 1);
    const [span] = container.childNodes;
    t.is(span.tagName, 'SPAN');
    t.is(span.className, 'editable editable-shop editable-active');
});

test('rendering inactive editable item', t => {
    const { container } = getContainer({
        active: false,
        item: 'shop',
        value: 'Tesco'
    });

    t.is(container.childNodes.length, 1);
    const [span] = container.childNodes;
    t.notRegex(span.className, /active/);
});
