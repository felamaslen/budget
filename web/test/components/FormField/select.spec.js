import test from 'ava';
import sinon from 'sinon';
import '~client-test/browser';
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import FormFieldSelect from '~client/components/FormField/select';

const getContainer = (customProps = {}, ...args) => {
    const props = {
        item: 'my-select-input',
        options: [
            { internal: 'something', external: 'Something' },
            { internal: 'else', external: 'My option' },
        ],
        value: 'something',
        onChange: () => null,
        ...customProps,
    };

    return render(<FormFieldSelect {...props} />, ...args);
};

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;

    t.is(div.tagName, 'DIV');
    t.is(div.childNodes.length, 1);

    const [select] = div.childNodes;

    t.is(select.tagName, 'SELECT');
    t.is(select.childNodes.length, 2);

    const [optionA, optionB] = select.childNodes;

    t.is(optionA.tagName, 'OPTION');
    t.is(optionB.tagName, 'OPTION');

    t.is(optionA.innerHTML, 'Something');
    t.is(optionB.innerHTML, 'My option');

    t.is(optionA.value, 'something');
    t.is(optionB.value, 'else');
});

test('handling onchange', t => {
    const onChange = sinon.stub();
    const { container } = getContainer({ onChange });

    const [div] = container.childNodes;
    const [select] = div.childNodes;

    t.is(onChange.getCalls().length, 0);

    fireEvent.change(select, { target: { value: 'else' } });

    t.is(onChange.getCalls().length, 1);

    t.deepEqual(onChange.getCalls()[0].args, ['else']);
});

test('if the available options updates, the value updates', t => {
    const onChange = sinon.stub();

    const optionsA = [{ internal: 'A' }, { internal: 'B' }, { internal: 'C' }];
    const optionsB = optionsA.slice(0, 2);
    const optionsC = optionsA.slice(0, 1);

    const { container } = getContainer({
        onChange,
        options: optionsA,
        value: 'B',
    });

    t.is(onChange.getCalls().length, 0);
    fireEvent.change(container.childNodes[0].childNodes[0], {
        target: { value: 'C' },
    });
    t.is(onChange.getCalls().length, 1);
    t.deepEqual(onChange.getCalls()[0].args, ['C']);

    act(() => {
        getContainer(
            { onChange, options: optionsB, value: 'C' },
            { container },
        );
    });

    // Change required, as C is no longer a valid option
    t.is(onChange.getCalls().length, 2);
    t.deepEqual(onChange.getCalls()[1].args, ['A']);

    act(() => {
        getContainer(
            { onChange, options: optionsC, value: 'A' },
            { container },
        );
    });

    // Change not required, as A is still in the options set
    t.is(onChange.getCalls().length, 2);
});
