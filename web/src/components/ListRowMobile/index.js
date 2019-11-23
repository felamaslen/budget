import React, { useContext, memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { rowShape } from '~client/prop-types/page/rows';
import { formatItem } from '~client/modules/format';
import { PageContext, ListContext } from '~client/context';
import { LIST_COLS_MOBILE } from '~client/constants/data';

import * as Styled from './styles';

function ListRowMobile({ style, item, setActive }) {
    const page = useContext(PageContext);
    const { AfterRowMobile } = useContext(ListContext);
    const onActivate = useCallback(() => setActive(item.id), [item.id, setActive]);

    return (
        <Styled.Row
            className={classNames('list-row-mobile', item.className || {})}
            style={style}
            small={item.small}
            onClick={onActivate}
        >
            {(LIST_COLS_MOBILE[page] || LIST_COLS_MOBILE.default).map(column => (
                <Styled.Column
                    key={column}
                    column={column}
                    className={classNames('column', column)}
                >
                    {formatItem(column, item[column])}
                </Styled.Column>
            ))}
            {AfterRowMobile && <AfterRowMobile item={item} />}
        </Styled.Row>
    );
}

ListRowMobile.propTypes = {
    page: PropTypes.string.isRequired,
    style: PropTypes.object,
    item: rowShape.isRequired,
    active: PropTypes.bool.isRequired,
    setActive: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    AfterRowMobile: PropTypes.func,
};

ListRowMobile.defaultProps = {
    style: {},
};

export default memo(ListRowMobile);
