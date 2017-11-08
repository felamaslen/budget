/**
 * Continuously synchronise the server with data modifications
 */

import { List as list } from 'immutable';
import { connect } from 'react-redux';

import {
    aSettingsLoaded, aServerUpdated, aTimeUpdated
} from '../../actions/app.actions';

import debounce from '../../misc/debounce';
import { TIMER_UPDATE_SERVER } from '../../misc/config';

import PureComponent from '../../immutable-component';
import PropTypes from 'prop-types';

export class DataSync extends PureComponent {
    componentDidMount() {
        this.props.loadSettings();

        setInterval(() => this.props.updateTime(), 1000);
    }
    componentDidUpdate(prevProps) {
        if (this.props.requestList.size > 0 &&
            !this.props.requestList.equals(prevProps.requestList)) {

            this.props.updateServer();
        }
    }
    render() {
        return null;
    }
}

DataSync.propTypes = {
    requestList: PropTypes.instanceOf(list).isRequired,
    loadSettings: PropTypes.func.isRequired,
    updateServer: PropTypes.func.isRequired,
    updateTime: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    requestList: state.getIn(['edit', 'requestList'])
});

const mapDispatchToProps = dispatch => ({
    loadSettings: () => dispatch(aSettingsLoaded()),
    updateServer: debounce(() => dispatch(aServerUpdated()), TIMER_UPDATE_SERVER),
    updateTime: () => dispatch(aTimeUpdated())
});

export default connect(mapStateToProps, mapDispatchToProps)(DataSync);

