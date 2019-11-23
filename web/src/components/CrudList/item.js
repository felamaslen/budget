import React, { useContext, useCallback } from 'react';
import PropTypes from 'prop-types';

import { PageContext } from '~client/context';
import { NULL_COMMAND } from '~client/hooks/nav';

export default function CrudListItem({
    data: {
        items,
        Item,
        onUpdate,
        onDelete,
        navState: { nav, activeId, activeColumn, command },
        setActive,
        setCommand,
        navNext,
        navPrev,
    },
    index,
    style,
}) {
    const page = useContext(PageContext);
    const item = items[index];
    const active = activeId === item.id;
    const noneActive = !nav && activeId === null;
    const odd = index % 2 === 1;

    const onDeleteCallback = useCallback(
        event => {
            if (event) {
                event.stopPropagation();
            }
            onDelete(item.id, { page }, item);
            setActive(null);
        },
        [item, setActive, onDelete, page],
    );

    if (!active) {
        return (
            <Item
                style={style}
                odd={odd}
                item={item}
                active={false}
                activeColumn={null}
                noneActive={noneActive}
                command={NULL_COMMAND}
                setCommand={setCommand}
                navNext={navNext}
                navPrev={navPrev}
                setActive={setActive}
                onUpdate={onUpdate}
                onDelete={onDeleteCallback}
            />
        );
    }

    return (
        <Item
            style={style}
            odd={odd}
            item={item}
            active={active}
            activeColumn={activeColumn}
            noneActive={noneActive}
            command={command}
            setCommand={setCommand}
            navNext={navNext}
            navPrev={navPrev}
            setActive={setActive}
            onUpdate={onUpdate}
            onDelete={onDeleteCallback}
        />
    );
}

CrudListItem.propTypes = {
    data: PropTypes.shape({
        items: PropTypes.array.isRequired,
        Item: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
        onUpdate: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired,
        navState: PropTypes.shape({
            nav: PropTypes.bool.isRequired,
            activeId: PropTypes.string,
            activeColumn: PropTypes.string,
            command: PropTypes.shape({
                type: PropTypes.string,
                id: PropTypes.string,
                column: PropTypes.string,
                payload: PropTypes.any,
            }),
        }),
        setActive: PropTypes.func.isRequired,
        setCommand: PropTypes.func.isRequired,
        navNext: PropTypes.func.isRequired,
        navPrev: PropTypes.func.isRequired,
    }).isRequired,
    index: PropTypes.number.isRequired,
    style: PropTypes.object,
};

CrudListItem.defaultProps = {
    style: {},
};
