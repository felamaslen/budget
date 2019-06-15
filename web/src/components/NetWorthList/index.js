import React from 'react';
import PropTypes from 'prop-types';

import { netWorthList } from '~client/components/NetWorthList/prop-types';
import CrudList from '~client/components/CrudList';
import NetWorthListItem from '~client/components/NetWorthList/net-worth-list-item';
import NetWorthListCreateItem from '~client/components/NetWorthList/net-worth-list-create-item';

import './style.scss';

export default function NetWorthList({ data, onCreate, onRead, onUpdate, onDelete }) {
    return (
        <div className="net-worth-list">
            <h4 className="title">{'List'}</h4>
            <CrudList
                items={data}
                Item={NetWorthListItem}
                CreateItem={NetWorthListCreateItem}
                onCreate={onCreate}
                onRead={onRead}
                onUpdate={onUpdate}
                onDelete={onDelete}
                className="net-worth-item"
            />
        </div>
    );
}

NetWorthList.propTypes = {
    data: netWorthList,
    onCreate: PropTypes.func.isRequired,
    onRead: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};
