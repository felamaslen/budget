import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import './style.scss';

export default function CrudList({ items, Item, CreateItem, onCreate, onRead, onUpdate, onDelete, extraProps }) {
    const onRefresh = useCallback(() => {
        onRead();
    }, [onRead]);

    return (
        <div className="crud-list">
            <div className="crud-list-meta">
                <button className="button-refresh" onClick={onRefresh}>
                    {'Refresh'}
                </button>
            </div>
            <ul className="crud-list-list">
                {items.map(({ id, ...rest }) => (
                    <li key={id} className="crud-list-list-item">
                        <Item
                            id={id}
                            {...rest}
                            onUpdate={onUpdate}
                            {...extraProps}
                        />
                        <button
                            className="button-delete"
                            onClick={() => onDelete(id)}
                        >&minus;</button>
                    </li>
                ))}
                <li key={0} className="crud-list-list-item crud-list-list-item-create">
                    <CreateItem
                        onCreate={onCreate}
                        {...extraProps}
                    />
                </li>
            </ul>
        </div>
    );
}

export const crudListPropTypes = {
    onCreate: PropTypes.func.isRequired,
    onRead: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

CrudList.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired
    })),
    Item: PropTypes.func.isRequired,
    CreateItem: PropTypes.func.isRequired,
    extraProps: PropTypes.object.isRequired,
    ...crudListPropTypes
};

CrudList.defaultProps = {
    extraProps: {}
};
