import React, { useContext, useCallback } from 'react';
import PropTypes from 'prop-types';

import { NetWorthContext, NetWorthListContext } from '~client/context';
import { CREATE_ID } from '~client/constants/data';
import { NetWorthAddForm } from '~client/components/NetWorthEditForm';
import * as Styled from './styles';

export default function NetWorthListCreateItem({ active, setActive, noneActive, onCreate }) {
    const { categories, subcategories } = useContext(NetWorthContext);
    const data = useContext(NetWorthListContext);
    const onActivate = useCallback(() => setActive(CREATE_ID), [setActive]);

    if (noneActive) {
        return (
            <Styled.ItemSummary add className="net-worth-list-item-summary" onClick={onActivate}>
                {'Add a new entry'}
            </Styled.ItemSummary>
        );
    }
    if (!active) {
        return null;
    }

    return (
        <NetWorthAddForm
            data={data}
            categories={categories}
            subcategories={subcategories}
            setActiveId={setActive}
            onCreate={onCreate}
        />
    );
}

NetWorthListCreateItem.propTypes = {
    active: PropTypes.bool.isRequired,
    setActive: PropTypes.func.isRequired,
    noneActive: PropTypes.bool.isRequired,
    onCreate: PropTypes.func.isRequired,
};
