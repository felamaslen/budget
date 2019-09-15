import React, { useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import memoize from 'memoize-one';
import { FixedSizeList, VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import { NULL_COMMAND, useNav } from '~client/hooks/nav';
import { CREATE_ID } from '~client/constants/data';
import CrudListItem from '~client/components/CrudList/item';

import './style.scss';

const itemProps = [
    'items',
    'extraProps',
    'Item',
    'onUpdate',
    'onDelete',
    'navState',
    'setActive',
    'setCommand',
    'navNext',
    'navPrev',
];

const getItemData = memoize((...args) => args.reduce((last, value, index) => ({
    ...last,
    [itemProps[index]]: value,
}), {}));

export default function CrudList({
    items,
    nav,
    itemSize,
    real,
    Item,
    CreateItem,
    BeforeList,
    AfterList,
    onCreate,
    onUpdate,
    onDelete,
    className,
    extraProps,
}) {
    const [navState, setActive, setCommand, navNext, navPrev] = useNav(nav, items, extraProps.page);
    const {
        activeId, activeItem, activeColumn, command,
    } = navState;

    const createActive = activeId === CREATE_ID;
    const noneActive = activeId === null;

    const getItemKey = useCallback((index) => items[index].id, [items]);

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
        ...extraProps,
    };

    const itemData = getItemData(
        items,
        extraProps,
        Item,
        onUpdate,
        onDelete,
        navState,
        setActive,
        setCommand,
        navNext,
        navPrev,
    );

    const variableSize = typeof itemSize === 'function';

    const List = variableSize
        ? VariableSizeList
        : FixedSizeList;

    const ref = useRef();
    useEffect(() => {
        if (variableSize && ref.current) {
            ref.current.resetAfterIndex(0);
        }
    }, [variableSize, itemSize]);

    return (
        <div className={classNames('crud-list', className, {
            active: activeId !== null,
            'create-active': createActive,
        })}>
            {BeforeList && <BeforeList {...metaProps} />}
            <div className={`crud-list-inner ${className}-inner`}>
                {CreateItem && (
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
                )}
                <div className={`crud-list-window ${className}-window`}>
                    {real && items.map((item, index) => (
                        <CrudListItem
                            key={item.id}
                            data={itemData}
                            index={index}
                        />
                    ))}
                    {!real && <AutoSizer>
                        {({ width, height }) => (
                            <List
                                ref={ref}
                                width={width}
                                height={height}
                                itemSize={itemSize}
                                itemCount={items.length}
                                itemData={itemData}
                                itemKey={getItemKey}
                                overscanCount={3}
                            >
                                {CrudListItem}
                            </List>
                        )}
                    </AutoSizer>}
                </div>
            </div>
            {AfterList && <AfterList {...metaProps} />}
        </div>
    );
}

CrudList.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
    })),
    nav: PropTypes.bool,
    itemSize: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    real: PropTypes.bool,
    Item: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
    CreateItem: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    BeforeList: PropTypes.func,
    AfterList: PropTypes.func,
    className: PropTypes.string,
    extraProps: PropTypes.object,
    onCreate: PropTypes.func.isRequired,
    onRead: PropTypes.func,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

CrudList.defaultProps = {
    className: 'crud-list',
    itemSize: 32,
    nav: false,
    real: false,
    BeforeList: null,
    AfterList: null,
    CreateItem: null,
    extraProps: {
        page: null,
    },
};
