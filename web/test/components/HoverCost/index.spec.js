import '../../browser';
import { expect } from 'chai';
import 'react-testing-library/cleanup-after-each';
import { render, fireEvent } from 'react-testing-library';
import React from 'react';
import HoverCost from '../../../src/components/HoverCost';

describe('<HoverCost />', () => {
    it('should render its value unmodified, if set not to abbreviate', () => {
        const { container: containerNone } = render(<HoverCost value="foo" abbreviate={false} />);

        expect(containerNone.children).to.have.length(1);

        const [child] = containerNone.childNodes;

        expect(child).to.have.property('tagName', 'SPAN');
        expect(child).to.have.property('innerHTML', 'foo');
    });

    let container = null;

    beforeEach(() => {
        container = render(<HoverCost value={123456.78} />).container;
    });

    it('should render an abbreviated currency value', () => {
        expect(container.childNodes).to.have.length(1);
        const [child] = container.childNodes;

        expect(child).to.have.property('tagName', 'SPAN');
        expect(child).to.have.property('className', 'hover-cost');
        expect(child.childNodes).to.have.length(1);

        const [abbreviated] = child.childNodes;
        expect(abbreviated).to.have.property('tagName', 'SPAN');
        expect(abbreviated).to.have.property('className', 'abbreviated');
        expect(abbreviated).to.have.property('innerHTML', '£1.2k');
    });

    it('should render a hover label on hover', () => {
        const [child] = container.childNodes;

        expect(child.childNodes).to.have.length(1);
        fireEvent.mouseEnter(child);
        expect(child.childNodes).to.have.length(2);

        const [abbreviated, full] = child.childNodes;

        expect(abbreviated).to.have.property('tagName', 'SPAN');
        expect(abbreviated).to.have.property('innerHTML', '£1.2k');

        expect(full).to.have.property('tagName', 'SPAN');
        expect(full).to.have.property('className', 'full');
        expect(full).to.have.property('innerHTML', '£1,234.57');
    });

    it('should remove the label on mouseout', () => {
        const [child] = container.childNodes;

        fireEvent.mouseEnter(child);

        expect(child.childNodes).to.have.length(2);
        fireEvent.mouseLeave(child);
        expect(child.childNodes).to.have.length(1);

        expect(child.childNodes[0].className).to.equal('abbreviated');
        expect(child.childNodes[0].innerHTML).to.equal('£1.2k');
    });
});

