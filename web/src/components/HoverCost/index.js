import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { formatCurrency } from '../../helpers/format';

export default class HoverCost extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hover: null
        };
    }
    static propTypes = {
        value: PropTypes.oneOfType([
            PropTypes.number.isRequired,
            PropTypes.string.isRequired
        ]),
        abbreviate: PropTypes.bool,
        precision: PropTypes.number
    };
    render() {
        const { abbreviate, value, ...props } = this.props;

        if (abbreviate === false) {
            return <span className="hover-cost">{this.props.value}</span>;
        }

        const formattedValue = formatCurrency(value, {
            brackets: true,
            ...props,
            abbreviate: false
        });
        const abbreviated = formatCurrency(value, {
            abbreviate: true,
            precision: 1,
            brackets: true,
            ...props
        });

        if (formattedValue === abbreviated) {
            return <span className="hover-cost">{formattedValue}</span>;
        }

        let label = null;
        if (this.state.hover) {
            label = <span className="full">{formattedValue}</span>;
        }

        const onMouseEnter = () => this.setState({ hover: true });

        const className = classNames('hover-cost', { hover: this.state.hover });

        return (
            <span className={className}
                onMouseEnter={onMouseEnter}
                onMouseLeave={() => this.setState({ hover: null })}>

                <span className="abbreviated">{abbreviated}</span>
                {label}
            </span>
        );
    }
}

