import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './style.scss';

export const CREATE_ID = 0;

function CrudListItem({
    Item,
    onUpdate,
    onDelete,
    active,
    setActiveId,
    item,
    itemProps,
    extraProps
}) {
    const onSetActive = useCallback(() => setActiveId(item.id), [item.id, setActiveId]);

    return (
        <li
            className="crud-list-list-item"
            onClick={onSetActive}
            {...itemProps(item)}
        >
            <Item
                item={item}
                active={active}
                onUpdate={onUpdate}
                {...extraProps}
            />
            <div className="button-delete">
                <button
                    className="button-delete-button"
                    onClick={() => onDelete(item.id)}
                >&minus;</button>
            </div>
        </li>
    );
}

CrudListItem.propTypes = {
    Item: PropTypes.func.isRequired,
    item: PropTypes.object.isRequired,
    active: PropTypes.bool.isRequired,
    setActiveId: PropTypes.func.isRequired,
    itemProps: PropTypes.func.isRequired,
    extraProps: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default function CrudList({
    items,
    Item,
    CreateItem,
    onCreate,
    onRead,
    onUpdate,
    onDelete,
    className,
    itemProps,
    extraProps
}) {
    const onRefresh = useCallback(() => {
        onRead();
    }, [onRead]);

    const [activeId, setActiveId] = useState(null);

    const onSetCreateActive = useCallback(() => setActiveId(CREATE_ID), []);

    return (
        <div className={classNames('crud-list', className)}>
            <div className="crud-list-meta">
                <button className="button-refresh" onClick={onRefresh}>
                    {'Refresh'}
                </button>
            </div>
            <ul className="crud-list-list">
                {items.map(item => (
                    <CrudListItem key={item.id}
                        Item={Item}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        active={activeId === item.id}
                        setActiveId={setActiveId}
                        item={item}
                        itemProps={itemProps}
                        extraProps={extraProps}
                    />
                ))}
                <li key={CREATE_ID}
                    className="crud-list-list-item crud-list-list-item-create"
                    onClick={onSetCreateActive}
                >
                    <CreateItem
                        active={activeId === CREATE_ID}
                        onCreate={onCreate}
                        {...extraProps}
                    />
                </li>
            </ul>
        </div>
    );
}

CrudList.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired
    })),
    Item: PropTypes.func.isRequired,
    CreateItem: PropTypes.func.isRequired,
    className: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]).isRequired,
    itemProps: PropTypes.func.isRequired,
    extraProps: PropTypes.object.isRequired,
    onCreate: PropTypes.func.isRequired,
    onRead: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

CrudList.defaultProps = {
    className: {},
    itemProps: () => ({}),
    extraProps: {}
};
