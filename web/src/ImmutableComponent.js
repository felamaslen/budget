import { Component } from 'react';
import { is } from 'immutable';

export default class ImmutablePureComponent extends Component {

    shouldComponentUpdate(nextProps, nextState) {
        const state = this.state || {};

        return !(this.updateOnProps || Object.keys(nextProps)).every(
            propKey => is(nextProps[propKey], this.props[propKey])
        ) || !(this.updateOnStates || Object.keys(nextState || {})).every(
            stateKey => is(nextState[stateKey], state[stateKey])
        );
    }
}

