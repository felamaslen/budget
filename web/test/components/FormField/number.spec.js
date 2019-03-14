import '../../browser';
import { expect } from 'chai';
import 'react-testing-library/cleanup-after-each';
import { render, fireEvent } from 'react-testing-library';
import React from 'react';
import FormFieldNumber from '../../../src/components/FormField/number';

describe('<FormFieldNumber />', () => {
    let changed = null;
    const onChange = value => {
        changed = value;
    };

    const props = {
        value: 103,
        onChange
    };

    it('should render its basic structure', () => {
        const { container } = render(<FormFieldNumber {...props} />);

        const [div] = container.childNodes;

        expect(div.tagName).to.equal('DIV');
        expect(div.className).to.equal('form-field form-field-number');
        expect(div.childNodes).to.have.length(1);
    });

    it('should render an input', () => {
        const { container } = render(<FormFieldNumber {...props} />);

        const [div] = container.childNodes;
        const [input] = div.childNodes;

        expect(input.tagName).to.equal('INPUT');
        expect(input.type).to.equal('number');
        expect(input.value).to.equal('103');
    });

    it('should fire onChange', () => {
        const { container } = render(<FormFieldNumber {...props} />);

        const [div] = container.childNodes;
        const [input] = div.childNodes;

        expect(changed).to.equal(null);

        fireEvent.change(input, { target: { value: '10.93' } });

        expect(changed).to.equal(null);

        fireEvent.blur(input);

        expect(changed).to.equal(10.93);
    });
});
