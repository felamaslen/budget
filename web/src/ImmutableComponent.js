import { Component } from 'react';
import { is } from 'immutable';

export function propsChanged(prev, next, skip = false) {
    if (skip) {
        return true;
    }

    if (!(next && prev)) {
        return !is(next, prev);
    }

    return Object.keys(next).some(key => !is(next[key], prev[key]));
}

export default class ImmutablePureComponent extends Component {
    shouldComponentUpdate(nextProps, nextState) {
        return propsChanged(this.props, nextProps, this.updateOnProps === false) ||
            propsChanged(this.state || {}, nextState, this.updateOnStates === false);
    }
}

