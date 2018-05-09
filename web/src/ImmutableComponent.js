import { Component } from 'react';
import { is } from 'immutable';

export function propsEqual(prev, next, skip = false) {
    if (skip) {
        return true;
    }

    return Object.keys(next).every(key => is(next[key], prev[key]));
}

export default class ImmutablePureComponent extends Component {
    shouldComponentUpdate(nextProps, nextState) {
        return !propsEqual(this.props, nextProps, this.updateOnProps === false) ||
            !propsEqual(this.state || {}, nextState, this.updateOnStates === false);
    }
}

