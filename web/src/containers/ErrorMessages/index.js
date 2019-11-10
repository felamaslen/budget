import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import { errorClosed } from '~client/actions/error';

import * as Styled from './styles';

const ErrorMessages = ({ list, onClose }) => (
    <Styled.MessageList>
        {list.map(({ id, closed, message: { text, level } }) => (
            <Styled.Message
                key={id}
                level={level}
                closed={closed}
                onClick={() => onClose(id)}
            >
                <span>{text}</span>
            </Styled.Message>
        ))}
    </Styled.MessageList>
);

ErrorMessages.propTypes = {
    list: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            closed: PropTypes.bool,
            message: PropTypes.shape({
                text: PropTypes.string.isRequired,
                level: PropTypes.number.isRequired,
            }).isRequired,
        }).isRequired,
    ).isRequired,
    onClose: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    list: state.error,
});

const mapDispatchToProps = {
    onClose: errorClosed,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ErrorMessages);
