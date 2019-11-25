import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';

import * as Styled from './styles';

const Spinner = ({ active }) =>
    active && (
        <Styled.Outer>
            <Styled.Inner>
                <Styled.Progress offset={15} />
                <Styled.Progress offset={105} />
            </Styled.Inner>
        </Styled.Outer>
    );

Spinner.propTypes = {
    active: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
    active: state.api.initialLoading,
});

export default connect(mapStateToProps)(Spinner);
