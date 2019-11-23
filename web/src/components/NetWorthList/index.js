import React from 'react';
import PropTypes from 'prop-types';

import { netWorthList } from '~client/prop-types/net-worth/list';
import { NetWorthListContext } from '~client/context';
import CrudList from '~client/components/CrudList';
import NetWorthListItem from '~client/components/NetWorthList/net-worth-list-item';
import NetWorthListCreateItem from '~client/components/NetWorthList/net-worth-list-create-item';

import * as Styled from './styles';

const NetWorthList = ({ data, onCreate, onUpdate, onDelete }) => (
    <NetWorthListContext.Provider value={data}>
        <Styled.NetWorthList className="net-worth-list">
            <CrudList
                items={data}
                real
                Item={NetWorthListItem}
                CreateItem={NetWorthListCreateItem}
                onCreate={onCreate}
                onUpdate={onUpdate}
                onDelete={onDelete}
                className="net-worth-list-crud"
            />
        </Styled.NetWorthList>
    </NetWorthListContext.Provider>
);

NetWorthList.propTypes = {
    data: netWorthList,
    onCreate: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default NetWorthList;
