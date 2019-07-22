import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { NULL_COMMAND, useNav } from '~client/hooks/nav';
import { CREATE_ID } from '~client/constants/data';

import './style.scss';

function ifActive(active, value) {
    if (!active) {
        return null;
    }

    return value;
}

const withNav = (nav, active, value) => ifActive(!nav || active, value);

function CrudListItem({
    Item,
    onUpdate,
    onDelete,
    active,
    activeColumn,
    noneActive,
    setActive,
    command,
    setCommand,
    nav,
    navNext,
    navPrev,
    item,
    itemProps,
    itemClassName,
    extraProps
}) {
    const onSetActive = useCallback(() => setActive(item.id), [item.id, setActive]);

    const onDeleteCallback = useCallback(event => {
        if (event) {
            event.stopPropagation();
        }
        onDelete(item.id, extraProps, item);
        setActive(null);
    }, [item, setActive, onDelete, extraProps]);

    const liProps = {};
    if (!nav && !active) {
        liProps.onClick = onSetActive;
    }

    return (
        <li
            className={classNames('crud-list-list-item', {
                active,
                ...itemClassName(item)
            })}
            {...liProps}
            {...itemProps(item)}
        >
            <Item
                item={item}
                active={active}
                activeColumn={activeColumn}
                noneActive={noneActive}
                command={active
                    ? command
                    : NULL_COMMAND
                }
                setCommand={setCommand}
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
    Item: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
    item: PropTypes.object.isRequired,
    active: PropTypes.bool.isRequired,
    activeColumn: PropTypes.string,
    noneActive: PropTypes.bool.isRequired,
    setActive: PropTypes.func.isRequired,
    command: PropTypes.object.isRequired,
    setCommand: PropTypes.func.isRequired,
    nav: PropTypes.bool.isRequired,
    navNext: PropTypes.func.isRequired,
    navPrev: PropTypes.func.isRequired,
    itemProps: PropTypes.func.isRequired,
    itemClassName: PropTypes.func.isRequired,
    extraProps: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

const CrudListItemMemo = React.memo(CrudListItem);

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
    itemClassName,
    extraProps
}) {
    const onRefresh = useCallback(() => onRead && onRead(), [onRead]);

    const [navState, setActive, setCommand, navNext, navPrev] = useNav(nav, items, extraProps.page);
    const { activeId, activeItem, activeColumn, command } = navState;

    const onSetCreateActive = useCallback(() => setActive(CREATE_ID), [setActive]);
    const createActive = activeId === CREATE_ID;
    const noneActive = activeId === null;

    const createLiProps = {};
    if (!nav && !createActive) {
        createLiProps.onClick = onSetCreateActive;
    }

    const createItem = CreateItem && (
        <li key={CREATE_ID}
            className={classNames('crud-list-list-item', 'crud-list-list-item-create', {
                active: createActive
            })}
            {...createLiProps}
        >
            <CreateItem
                active={createActive}
                activeColumn={createActive
                    ? activeColumn
                    : null
                }
                noneActive={noneActive}
                setActive={setActive}
                command={command.id === CREATE_ID
                    ? command
                    : NULL_COMMAND}
                setCommand={setCommand}
                navNext={navNext}
                navPrev={navPrev}
                onCreate={onCreate} {...extraProps}
            />
        </li>
    );

    const metaProps = {
        active: activeId,
        setActive,
        activeItem,
        activeColumn,
        navNext,
        navPrev,
        onCreate,
        onUpdate,
        onDelete,
        ...extraProps
    };

    return (
        <div className={classNames('crud-list', className, {
            active: activeId !== null
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
                {items.map(item => {
                    const active = activeId === item.id;

                    return <CrudListItemMemo key={item.id}
                        Item={Item}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        nav={nav}
                        active={active}
                        activeColumn={withNav(nav, active, activeColumn)}
                        noneActive={!nav && noneActive}
                        setActive={setActive}
                        command={command.id === item.id
                            ? command
                            : NULL_COMMAND
                        }
                        setCommand={setCommand}
                        navNext={navNext}
                        navPrev={navPrev}
                        item={item}
                        itemProps={itemProps}
                        itemClassName={itemClassName}
                        extraProps={extraProps}
                    />;
                })}
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
    Item: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
    CreateItem: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    beforeList: PropTypes.node,
    BeforeList: PropTypes.func,
    afterList: PropTypes.node,
    AfterList: PropTypes.func,
    className: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    itemProps: PropTypes.func,
    itemClassName: PropTypes.func,
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
    itemClassName: () => ({}),
    extraProps: {
        page: null
    }
};
