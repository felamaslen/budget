import { Map as map } from 'immutable';
import connect, { Body } from '../../list/body';

import React from 'react';
import PropTypes from 'prop-types';

import getFundsHead from '../head';
import ListRowFunds from '../row';

export class BodyFunds extends Body {
    headDesktop(render) {
        if (!render) {
            return null;
        }

        const HeadFunds = getFundsHead();

        return <HeadFunds gainInfo={this.props.gainInfo} />;
    }
    listRow() {
        return ListRowFunds;
    }
}

BodyFunds.propTypes = {
    gainInfo: PropTypes.instanceOf(map).isRequired
};

const mapStateToProps = () => () => ({});

const mapDispatchToProps = () => () => ({});

export default () => connect('funds')(mapStateToProps, mapDispatchToProps)(BodyFunds);

