import '~client-test/browser.js';
import { expect } from 'chai';
import 'react-testing-library/cleanup-after-each';
import { render, fireEvent } from 'react-testing-library';
import React from 'react';
import FormFieldDate from '~client/components/FormField/date';
import { dateInput } from '~client/helpers/date';

describe('<FormFieldDate />', () => {
    let changed = null;
    beforeEach(() => {
        changed = null;
    });

    const onChange = value => {
        changed = value;
    };

    const props = {
        value: dateInput('10/11/2017'),
        onChange
    };

    it('should render its basic structure', () => {
        const { container } = render(<FormFieldDate {...props} />);

        const [div] = container.childNodes;

        expect(div.tagName).to.equal('DIV');

        expect(div.className).to.equal('form-field form-field-date');

        expect(div.childNodes).to.have.length(1);
    });

    it('should render an input', () => {
        const { container } = render(<FormFieldDate {...props} />);

        const [div] = container.childNodes;
        const [input] = div.childNodes;

        expect(input.tagName).to.equal('INPUT');
        expect(input.type).to.equal('date');
        expect(input.value).to.equal('2017-11-10');
    });

    it('should fire onChange', () => {
        const { container } = render(<FormFieldDate {...props} />);

        const [div] = container.childNodes;
        const [input] = div.childNodes;

        expect(changed).to.equal(null);

        fireEvent.change(input, { target: { value: '2014-04-09' } });

        expect(changed).to.equal(null);

        fireEvent.blur(input);

        expect(changed.toString()).to.deep.equal(dateInput('9/4/2014').toString());
    });

    it('should handle bad values', () => {
        const { container } = render(<FormFieldDate {...props} />);

        const [div] = container.childNodes;
        const [input] = div.childNodes;

        expect(changed).to.equal(null);

        fireEvent.change(input, { target: { value: 'not a date' } });
        fireEvent.blur(input);

        expect(changed.toString()).to.equal('Invalid DateTime');
    });
});
