import React, { useContext, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import memoize from 'memoize-one';
import { FixedSizeList, VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import { NULL_COMMAND, useNav } from '~client/hooks/nav';
import { PageContext, NavContext } from '~client/context';
import { CREATE_ID } from '~client/constants/data';
import CrudListItem from '~client/components/CrudList/item';

import * as Styled from './styles';

const itemProps = [
    'items',
    'Item',
    'onUpdate',
    'onDelete',
    'navState',
    'setActive',
    'setCommand',
    'navNext',
    'navPrev',
];

const getItemData = memoize((...args) =>
    args.reduce(
        (last, value, index) => ({
            ...last,
            [itemProps[index]]: value,
        }),
        {},
    ),
);

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
}) {
    const page = useContext(PageContext);
    const [navState, setActive, setCommand, navNext, navPrev] = useNav(nav, items, page);
    const { activeId, activeItem, activeColumn, command } = navState;

    const createActive = activeId === CREATE_ID;
    const noneActive = activeId === null;

    const getItemKey = useCallback(index => items[index].id, [items]);

    const navProps = {
        active: activeId,
        setActive,
        activeItem,
        activeColumn,
        navNext,
        navPrev,
        onCreate,
        onUpdate,
        onDelete,
    };

    const itemData = getItemData(
        items,
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

    const List = variableSize ? VariableSizeList : FixedSizeList;

    const ref = useRef();
    useEffect(() => {
        if (variableSize && ref.current) {
            ref.current.resetAfterIndex(0);
        }
    }, [variableSize, itemSize]);

    const active = activeId !== null;

    return (
        <Styled.CrudList
            active={active}
            className={classNames('crud-list', className, {
                active: activeId !== null,
                'create-active': createActive,
            })}
        >
            <NavContext.Provider value={navProps}>
                {BeforeList && <BeforeList />}
                <Styled.CrudListInner
                    active={active}
                    className={`crud-list-inner ${className}-inner`}
                >
                    {CreateItem && (
                        <CreateItem
                            active={createActive}
                            activeColumn={createActive ? activeColumn : null}
                            noneActive={noneActive}
                            setActive={setActive}
                            command={command.id === CREATE_ID ? command : NULL_COMMAND}
                            setCommand={setCommand}
                            navNext={navNext}
                            navPrev={navPrev}
                            onCreate={onCreate}
                        />
                    )}
                    <Styled.CrudWindow
                        active={active}
                        createActive={createActive}
                        className={`crud-list-window ${className}-window`}
                    >
                        {real &&
                            items.map((item, index) => (
                                <CrudListItem key={item.id} data={itemData} index={index} />
                            ))}
                        {!real && (
                            <AutoSizer>
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
                            </AutoSizer>
                        )}
                    </Styled.CrudWindow>
                </Styled.CrudListInner>
                {AfterList && <AfterList />}
            </NavContext.Provider>
        </Styled.CrudList>
    );
}

CrudList.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
    ),
    nav: PropTypes.bool,
    itemSize: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    real: PropTypes.bool,
    Item: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
    CreateItem: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    BeforeList: PropTypes.func,
    AfterList: PropTypes.func,
    className: PropTypes.string,
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
};
