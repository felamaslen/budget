import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { PAGES, CREATE_ID } from '~client/constants/data';
import { NULL_COMMAND, ADD_BTN } from '~client/hooks/nav';
import { VALUE_SET } from '~client/modules/nav';
import ListRowCell from '~client/components/ListRowCell';
import DailyText from '~client/components/DailyText';

export function ListRowDesktopBase(props) {
    const {
        item,
        activeColumn,
        setActive,
        onUpdate,
        command,
        setCommand,
        page
    } = props;

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
    command,
    setCommand,
    onUpdate,
    AfterRow,
    activeColumn,
    setActive
}) {
    const onColumnUpdate = useCallback((column, value) => onUpdate(page, item.id, {
        ...item,
        [column]: value
    }, item), [onUpdate, page, item]);

    return (
        <>
            <ListRowDesktopBase
                item={item}
                page={page}
                activeColumn={activeColumn}
                setActive={setActive}
                command={command}
                setCommand={setCommand}
                onUpdate={onColumnUpdate}
            />
            {PAGES[page].daily && <DailyText value={item.daily} />}
            {AfterRow && <AfterRow page={page} row={item} />}
        </>
    );
}

ListRowDesktop.propTypes = {
    ...ListRowDesktopBase.propTypes,
    page: PropTypes.string.isRequired,
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
    daily: PropTypes.number,
    AfterRow: PropTypes.func
};

ListRowDesktop.defaultProps = {
    active: false
};

export default React.memo(ListRowDesktop);
