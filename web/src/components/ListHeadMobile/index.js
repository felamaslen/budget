import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PageContext } from '~client/context';
import { LIST_COLS_MOBILE } from '~client/constants/data';

import * as Styled from './styles';

export default function ListHeadMobile() {
    const page = useContext(PageContext);

    return (
        <Styled.ListHead className="list-head">
            {(LIST_COLS_MOBILE[page] || LIST_COLS_MOBILE.default).map(column => (
                <Styled.Header
                    key={column}
                    column={column}
                    className={classNames('column', column)}
                >
                    {column}
                </Styled.Header>
            ))}
        </Styled.ListHead>
    );
}
