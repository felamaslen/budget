import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PAGES, CREATE_ID } from '~client/constants/data';
import { NULL_COMMAND, ADD_BTN } from '~client/hooks/nav';
import { VALUE_SET } from '~client/modules/nav';
import ListRowCell from '~client/components/ListRowCell';
import DailyText from '~client/components/DailyText';

export function ListRowDesktopBase({
    item,
    activeColumn,
    setActive,
    onUpdate,
    command,
    setCommand,
    page
}) {
    const columns = PAGES[page].cols;

    const onSuggestionConfirmed = useCallback((column, nextValue) => {
        const nextColumn = columns[columns.indexOf(column) + 1];

        let toId = null;
        let toColumn = null;
        if (nextColumn) {
            toId = item.id;
            toColumn = nextColumn;
        } else if (item.id === CREATE_ID) {
            toId = item.id;
            toColumn = ADD_BTN;
        }

        if (nextColumn && nextValue) {
            setCommand({
                command: VALUE_SET,
                column: nextColumn,
                payload: nextValue,
                activeId: toId,
                activeColumn: toColumn
            });
        } else {
            setActive(toId, toColumn);
        }


    }, [item.id, columns, setCommand, setActive]);

    return columns.map(column => (
        <ListRowCell key={column}
            page={page}
            id={item.id}
            column={column}
            onSuggestionConfirmed={onSuggestionConfirmed}
            value={item[column]}
            active={activeColumn === column}
            setActive={setActive}
            command={column === command.column
                ? command
                : NULL_COMMAND
            }
            onUpdate={onUpdate}
        />
    ));
}

ListRowDesktopBase.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.string.isRequired
    }).isRequired,
    page: PropTypes.string.isRequired,
    activeColumn: PropTypes.string,
    setActive: PropTypes.func.isRequired,
    command: PropTypes.object.isRequired,
    setCommand: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired
};

function ListRowDesktop({
    page,
    item,
    style,
    odd,
    command,
    setCommand,
    onUpdate,
    onDelete,
    AfterRow,
    activeColumn,
    setActive
}) {
    const onColumnUpdate = useCallback((column, value) => onUpdate(page, item.id, {
        ...item,
        [column]: value
    }, item), [onUpdate, page, item]);

    return (
        <div
            className={classNames('list-row-desktop', item.className || {}, {
                odd,
                future: item.future,
                'first-present': item.firstPresent
            })}
            style={style}
        >
            <ListRowDesktopBase
                item={item}
                page={page}
                activeColumn={activeColumn}
                setActive={setActive}
                command={command.id && command.id === item.id
                    ? command
                    : NULL_COMMAND
                }
                setCommand={setCommand}
                onUpdate={onColumnUpdate}
            />
            {PAGES[page].daily && <DailyText value={item.daily} />}
            <div className="button-delete">
                <button
                    className="button-delete-button"
                    onClick={onDelete}
                >&minus;</button>
            </div>
            {AfterRow && <AfterRow page={page} row={item} />}
        </div>
    );
}

ListRowDesktop.propTypes = {
    ...ListRowDesktopBase.propTypes,
    page: PropTypes.string.isRequired,
    style: PropTypes.object,
    odd: PropTypes.bool.isRequired,
    item: PropTypes.shape({
        id: PropTypes.string.isRequired,
        future: PropTypes.bool,
        firstPresent: PropTypes.bool,
        daily: PropTypes.number,
        className: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.string
        ])
    }).isRequired,
    active: PropTypes.bool,
    command: PropTypes.object.isRequired,
    setCommand: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    daily: PropTypes.number,
    AfterRow: PropTypes.func
};

ListRowDesktop.defaultProps = {
    style: {},
    active: false
};

export default memo(ListRowDesktop);
