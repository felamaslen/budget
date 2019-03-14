import '../../browser';
import { expect } from 'chai';
import 'react-testing-library/cleanup-after-each';
import { render, fireEvent } from 'react-testing-library';
import React from 'react';
import FormFieldCost from '../../../src/components/FormField/cost';

describe('<FormFieldCost />', () => {
    let changed = null;
    const onChange = value => {
        changed = value;
    };

    const props = {
        value: 10345,
        onChange
    };

    it('should render its basic structure', () => {
        const { container } = render(<FormFieldCost {...props} />);

        const [div] = container.childNodes;

        expect(div.tagName).to.equal('DIV');

        expect(div.className).to.equal('form-field form-field-cost');

        expect(div.childNodes).to.have.length(1);
    });

    it('should render an input', () => {
        const { container } = render(<FormFieldCost {...props} />);

        const [div] = container.childNodes;
        const [input] = div.childNodes;

        expect(input.tagName).to.equal('INPUT');
        expect(input.type).to.equal('number');
        expect(input.step).to.equal('0.01');
        expect(input.value).to.equal('103.45');
    });

    it('should fire onChange', () => {
        const { container } = render(<FormFieldCost {...props} />);

        const [div] = container.childNodes;
        const [input] = div.childNodes;

        expect(changed).to.equal(null);

        fireEvent.change(input, { target: { value: '10.93' } });

        expect(changed).to.equal(null);

        fireEvent.blur(input);

        expect(changed).to.equal(1093);
    });
});

