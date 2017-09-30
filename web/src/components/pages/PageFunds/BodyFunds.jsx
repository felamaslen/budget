import connect, { Body } from '../../PageList/Body';

import React from 'react';
import PropTypes from 'prop-types';

import ListRowFunds from './ListRowFunds';

export class BodyFunds extends Body {
    getListRow() {
        return ListRowFunds;
    }
}

BodyFunds.propTypes = {
};

const mapStateToProps = () => () => ({});

const mapDispatchToProps = () => () => ({});

export default pageIndex => connect(pageIndex)(mapStateToProps, mapDispatchToProps)(BodyFunds);

