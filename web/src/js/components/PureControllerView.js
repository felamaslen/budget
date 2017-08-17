/**
 * Custom react component class
 * Compares previous state to next state and updates component accordingly
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Dispatcher } from 'flux';
import shallowEqual from 'react-pure-render/shallowEqual';

export default class PureControllerView extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        return !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState);
    }

    dispatchAction(action) {
        this.props.dispatcher.dispatch(action);
    }
    dispatchNext(action) {
        window.setTimeout(() => {
            this.props.dispatcher.dispatch(action);
        }, 0);
    }
}

PureControllerView.propTypes = {
    dispatcher: PropTypes.instanceOf(Dispatcher)
};

