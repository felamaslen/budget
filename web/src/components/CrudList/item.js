import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { NULL_COMMAND } from '~client/hooks/nav';

export default function CrudListItem({
    data: {
        items,
        extraProps,
        Item,
        onUpdate,
        onDelete,
        navState: { nav, activeId, activeColumn, command },
        setActive,
        setCommand,
        navNext,
        navPrev
    },
    index,
    style
}) {
    const item = items[index];
    const active = activeId === item.id;
    const noneActive = !nav && activeId === null;
    const odd = index % 2 === 1;

    const onDeleteCallback = useCallback(event => {
        if (event) {
            event.stopPropagation();
        }
        onDelete(item.id, extraProps, item);
        setActive(null);
    }, [item, setActive, onDelete, extraProps]);

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
                {...extraProps}
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
            {...extraProps}
        />
    );
}

CrudListItem.propTypes = {
    data: PropTypes.shape({
        items: PropTypes.array.isRequired,
        extraProps: PropTypes.object,
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
                payload: PropTypes.any
            })
        }),
        setActive: PropTypes.func.isRequired,
        setCommand: PropTypes.func.isRequired,
        navNext: PropTypes.func.isRequired,
        navPrev: PropTypes.func.isRequired
    }).isRequired,
    index: PropTypes.number.isRequired,
    style: PropTypes.object
};

CrudListItem.defaultProps = {
    style: {}
};
