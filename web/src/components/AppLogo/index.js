import React from 'react';
import PropTypes from 'prop-types';

import * as Styled from './styles';

const AppLogo = ({ loading, unsaved }) => (
    <Styled.AppLogo className="app-logo">
        {unsaved && (
            <Styled.QueueNotSaved>{'Unsaved changes!'}</Styled.QueueNotSaved>
        )}
        <Styled.Logo>
            <span>{'Budget'}</span>
            {loading && <Styled.LoadingApi />}
        </Styled.Logo>
    </Styled.AppLogo>
);

AppLogo.propTypes = {
    loading: PropTypes.bool.isRequired,
    unsaved: PropTypes.bool.isRequired,
};

export default AppLogo;
