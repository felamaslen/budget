import React, { useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useNav } from '~client/hooks/nav';

import './style.scss';

export const CREATE_ID = 'CREATE_ID';

function CrudListItem({
    Item,
    onUpdate,
    onDelete,
    active,
    isActive,
    setActive,
    navNext,
    navPrev,
    item,
    itemProps,
    extraProps
}) {
    const onSetActive = useCallback(() => setActive(item.id), [item.id, setActive]);

    const onDeleteCallback = useCallback(event => {
        if (event) {
            event.stopPropagation();
        }
        onDelete(item.id);
        setActive(null);
    }, [item.id, setActive, onDelete]);

    return (
        <li
            className={classNames('crud-list-list-item', { active: isActive })}
            onClick={onSetActive}
            {...itemProps(item)}
        >
            <Item
                item={item}
                active={isActive}
                activeId={active}
                navNext={navNext}
                navPrev={navPrev}
                setActive={setActive}
                onUpdate={onUpdate}
                {...extraProps}
            />
            {!active && <div className="button-delete">
                <button
                    className="button-delete-button"
                    onClick={onDeleteCallback}
                >&minus;</button>
            </div>}
        </li>
    );
}

CrudListItem.propTypes = {
    Item: PropTypes.func.isRequired,
    item: PropTypes.object.isRequired,
    active: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ index: PropTypes.number, maxIndex: PropTypes.number })]),
    isActive: PropTypes.bool.isRequired,
    setActive: PropTypes.func.isRequired,
    navNext: PropTypes.func.isRequired,
    navPrev: PropTypes.func.isRequired,
    itemProps: PropTypes.func.isRequired,
    extraProps: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default function CrudList({
    items,
    Item,
    reverse,
    nav,
    CreateItem,
    beforeList,
    BeforeList,
    afterList,
    AfterList,
    onCreate,
    onRead,
    onUpdate,
    onDelete,
    className,
    itemProps,
    extraProps
}) {
    const onRefresh = useCallback(() => onRead && onRead(), [onRead]);

    const [active, setActive, navNext, navPrev] = useNav(nav, items);

    useEffect(() => {
        if (!nav && active !== CREATE_ID && !items.some(({ id }) => id === active)) {
            setActive(null);
        }
    }, [nav, active, setActive, items]);

    const onSetCreateActive = useCallback(() => setActive(CREATE_ID), [setActive]);
    const createActive = active && typeof active === 'object'
        ? active.index === -1
        : active === CREATE_ID;

    const createItem = CreateItem && (
        <li key={CREATE_ID}
            className={classNames('crud-list-list-item', 'crud-list-list-item-create', {
                active: createActive
            })}
            onClick={onSetCreateActive}
        >
            <CreateItem
                active={createActive}
                activeId={active}
                setActive={setActive}
                onCreate={onCreate} {...extraProps}
            />
        </li>
    );

    const activeItem = useMemo(() => {
        if (nav) {
            if (!active || active.index === null || active.index === -1) {
                return null;
            }

            return items[active.index];
        }

        if (active === null || active === CREATE_ID) {
            return null;
        }

        return items.find(({ id }) => id === active);
    }, [nav, items, active]);

    const metaProps = {
        active,
        setActive,
        activeItem,
        onCreate,
        onUpdate,
        onDelete,
        ...extraProps
    };

    return (
        <div className={classNames('crud-list', className, {
            active: active !== null
        })}>
            <div className="crud-list-meta">
                {onRead && <button className="button-refresh" onClick={onRefresh}>
                    {'Refresh'}
                </button>}
            </div>
            {beforeList}
            {BeforeList && <BeforeList {...metaProps} />}
            <ul className="crud-list-list">
                {reverse && createItem}
                {items.map((item, index) => (
                    <CrudListItem key={item.id}
                        Item={Item}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        nav={nav}
                        active={active}
                        isActive={active && typeof active === 'object'
                            ? index === active.index
                            : item.id === active
                        }
                        setActive={setActive}
                        navNext={navNext}
                        navPrev={navPrev}
                        item={item}
                        itemProps={itemProps}
                        extraProps={extraProps}
                    />
                ))}
                {!reverse && createItem}
            </ul>
            {afterList}
            {AfterList && <AfterList {...metaProps} />}
        </div>
    );
}

CrudList.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired
    })),
    reverse: PropTypes.bool,
    nav: PropTypes.bool,
    Item: PropTypes.func.isRequired,
    CreateItem: PropTypes.func,
    beforeList: PropTypes.node,
    BeforeList: PropTypes.func,
    afterList: PropTypes.node,
    AfterList: PropTypes.func,
    className: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    itemProps: PropTypes.func,
    extraProps: PropTypes.object,
    onCreate: PropTypes.func.isRequired,
    onRead: PropTypes.func,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

CrudList.defaultProps = {
    className: {},
    onRead: null,
    reverse: false,
    nav: false,
    beforeList: null,
    BeforeList: null,
    afterList: null,
    AfterList: null,
    CreateItem: null,
    itemProps: () => ({}),
    extraProps: {}
};
