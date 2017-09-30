import { List as list } from 'immutable';
import extendableContainer from '../containerExtender';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import AddForm from './AddForm';
import { ListRowContainer as getListRowDefault } from './ListRow';

export class Body extends PureComponent {
    getListRow() {
        return getListRowDefault(this.props.pageIndex);
    }
    render() {
        const ListRow = this.getListRow();

        const rows = this.props.rowIds.map(id => <ListRow key={id} id={id} />);

        return <ul className="list-ul">
            <AddForm pageIndex={this.props.pageIndex} />
            {rows}
        </ul>;
    }
}

Body.propTypes = {
    pageIndex: PropTypes.number.isRequired,
    rowIds: PropTypes.instanceOf(list).isRequired
};

const stateDefault = pageIndex => state => ({
    pageIndex,
    rowIds: state
        .getIn(['global', 'pages', pageIndex, 'rows'])
        .keySeq()
        .toList()
});

const dispatchDefault = () => () => ({});

export const BodyContainer = pageIndex =>
    extendableContainer(stateDefault, dispatchDefault)(pageIndex)()(Body);

export default extendableContainer(stateDefault, dispatchDefault);

