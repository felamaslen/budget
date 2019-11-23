import React, { useContext, memo, useCallback } from 'react';
import PropTypes from 'prop-types';

import { netWorthItem } from '~client/prop-types/net-worth/list';
import { NetWorthContext } from '~client/context';
import { ButtonDelete } from '~client/styled/shared/button';
import { NetWorthEditForm } from '~client/components/NetWorthEditForm';

import * as Styled from './styles';

function NetWorthListItem({ item, active, noneActive, setActive, onUpdate, onDelete }) {
    const { categories, subcategories } = useContext(NetWorthContext);
    const onActivate = useCallback(() => setActive(item.id), [item.id, setActive]);

    if (noneActive) {
        return (
            <Styled.ItemSummary className="net-worth-list-item-summary" onClick={onActivate}>
                <span className="entry-title">{item.date.toFormat('dd MMM yy')}</span>
                <Styled.ButtonDelete className="button-delete">
                    <ButtonDelete className="button-delete-button" onClick={onDelete}>
                        &minus;
                    </ButtonDelete>
                </Styled.ButtonDelete>
            </Styled.ItemSummary>
        );
    }
    if (!active) {
        return null;
    }

    return (
        <NetWorthEditForm
            item={item}
            categories={categories}
            subcategories={subcategories}
            setActiveId={setActive}
            onUpdate={onUpdate}
        />
    );
}

NetWorthListItem.propTypes = {
    item: netWorthItem.isRequired,
    active: PropTypes.bool.isRequired,
    noneActive: PropTypes.bool.isRequired,
    setActive: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default memo(NetWorthListItem);
