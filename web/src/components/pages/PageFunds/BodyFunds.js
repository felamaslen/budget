import { Map as map } from 'immutable';
import connect, { Body } from '../../PageList/Body';

import React from 'react';
import PropTypes from 'prop-types';

import getFundsHead from './HeadFunds';
import ListRowFunds from './ListRowFunds';

export class BodyFunds extends Body {
    headDesktop(render) {
        if (!render) {
            return null;
        }

        const HeadFunds = getFundsHead(this.props.pageIndex);

        return <HeadFunds gainInfo={this.props.gainInfo} />;
    }
    getListRow() {
        return ListRowFunds;
    }
}

BodyFunds.propTypes = {
    gainInfo: PropTypes.instanceOf(map).isRequired
};

const mapStateToProps = () => () => ({});

const mapDispatchToProps = () => () => ({});

export default pageIndex => connect(pageIndex)(mapStateToProps, mapDispatchToProps)(BodyFunds);

