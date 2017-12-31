import { connect } from 'react-redux';
import React from 'react';
import HeadDesktop from '../head/desktop';
import AddForm from '../add-form';
import ListRow from '../row/desktop';

function bodyDesktop(propTypes) {
    function BodyDesktop({ page, rowIds }) {
        const rows = rowIds.map(id => <ListRow key={id} page={page} id={id} />);

        return <ul className="list-ul">
            <li className="list-head">
                <HeadDesktop page={page} />
            </li>
            <AddForm page={page} />
            {rows}
        </ul>;
    }

    BodyDesktop.propTypes = {
        ...propTypes
    };

    return BodyDesktop;
}

export default (propTypes, mapStateToProps) => connect(mapStateToProps)(bodyDesktop(propTypes));

