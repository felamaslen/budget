import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';

import App from '../../components/app';

export default function Root({ store, history }) {
    return <Provider store={store}>
        <App history={history} />
    </Provider>;
}

Root.propTypes = {
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
};

