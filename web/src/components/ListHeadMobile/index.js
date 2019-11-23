import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { LIST_COLS_MOBILE } from '~client/constants/data';

import * as Styled from './styles';

const ListHeadMobile = ({ listColsMobile }) => (
    <Styled.ListHead className="list-head">
        {listColsMobile.map(column => (
            <Styled.Header key={column} column={column} className={classNames('column', column)}>
                {column}
            </Styled.Header>
        ))}
    </Styled.ListHead>
);

ListHeadMobile.propTypes = {
    listColsMobile: PropTypes.arrayOf(PropTypes.string.isRequired),
};

ListHeadMobile.defaultProps = {
    listColsMobile: LIST_COLS_MOBILE,
};

export default ListHeadMobile;
