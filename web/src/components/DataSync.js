/**
 * Continuously synchronise the server with data modifications
 */

import { List as list } from 'immutable';

import { connect } from 'react-redux';

import debounce from '../misc/debounce';

import { aServerUpdated, aTimeUpdated } from '../actions/AppActions';
import { aErrorOpened } from '../actions/ErrorActions';

import { TIMER_UPDATE_SERVER } from '../misc/config';

import { Component } from 'react';
import PropTypes from 'prop-types';

export class DataSync extends Component {
    componentDidMount() {
        setInterval(() => this.props.updateTime(), 1000);
    }
    componentDidUpdate(prevProps) {
        if (!this.props.requestList.equals(prevProps.requestList)) {
            this.props.updateServer(this.props.apiKey, this.props.requestList);
        }
    }
    render() {
        return null;
    }
}

DataSync.propTypes = {
    apiKey: PropTypes.string,
    requestList: PropTypes.instanceOf(list).isRequired,
    updateServer: PropTypes.func.isRequired,
    openError: PropTypes.func.isRequired,
    updateTime: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    apiKey: state.getIn(['global', 'user', 'apiKey']),
    requestList: state.getIn(['global', 'edit', 'requestList']),
    serverUpdateStatus: state.getIn(['global', 'edit', 'status'])
});

const mapDispatchToProps = dispatch => ({
    updateServer: debounce(
        (apiKey, requestList) => dispatch(aServerUpdated(apiKey, requestList)),
        TIMER_UPDATE_SERVER
    ),
    openError: message => dispatch(aErrorOpened(message)),
    updateTime: () => dispatch(aTimeUpdated())
});

export default connect(mapStateToProps, mapDispatchToProps)(DataSync);

