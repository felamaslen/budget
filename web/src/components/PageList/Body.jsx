import { List as list } from 'immutable';
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import AddForm from './AddForm';
import ListRow from './ListRow';

export class Body extends PureComponent {
    render() {
        const rows = this.props.rowKeys.map(
            key => <ListRow key={key} rowKey={key}
                pageIndex={this.props.pageIndex} />
        );

        return <ul className="list-ul">
            <AddForm pageIndex={this.props.pageIndex} />
            {rows}
        </ul>;
    }
}

Body.propTypes = {
    pageIndex: PropTypes.number.isRequired,
    rowKeys: PropTypes.instanceOf(list).isRequired
};

const mapStateToProps = (state, ownProps) => ({
    rowKeys: state
        .getIn(['global', 'pages', ownProps.pageIndex, 'rows'])
        .map((row, key) => key)
});

export default connect(mapStateToProps)(Body);

