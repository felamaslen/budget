import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './style.scss';

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

    return (
        <div className={classNames('crud-list', className)}>
            <div className="crud-list-meta">
                <button className="button-refresh" onClick={onRefresh}>
                    {'Refresh'}
                </button>
            </div>
            <ul className="crud-list-list">
                {items.map(({ id, ...rest }) => (
                    <li key={id} className="crud-list-list-item" {...itemProps(id, rest)}>
                        <Item
                            id={id}
                            {...rest}
                            onUpdate={onUpdate}
                            {...extraProps}
                        />
                        <div className="button-delete">
                            <button
                                className="button-delete-button"
                                onClick={() => onDelete(id)}
                            >&minus;</button>
                        </div>
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
    className: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]).isRequired,
    extraProps: PropTypes.object.isRequired,
    ...crudListPropTypes
};

CrudList.defaultProps = {
    className: {},
    itemProps: () => ({}),
    extraProps: {}
};
