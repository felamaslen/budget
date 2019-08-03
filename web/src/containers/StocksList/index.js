import { connect } from 'react-redux';
import { DO_STOCKS_LIST } from '~client/constants/stocks';
import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { stocksListCleared, stocksListRequested } from '~client/actions/stocks';
import { getStocksList } from '~client/selectors/stocks';
import { dataShape } from '~client/prop-types/graph';

import './style.scss';

function PriceDisplay({ price, gain, priceFirst, onClick }) {
    if (!price) {
        return null;
    }
    if (gain === null) {
        return (
            <span className="price">{price}</span>
        );
    }

    return (
        <span
            className={classNames('price-gain', { 'price-first': priceFirst })}
            onClick={onClick}
        >
            <span className="price">{price}</span>
            <span className="gain">{gain.toPrecision(3)}</span>
        </span>
    );
}

PriceDisplay.propTypes = {
    price: PropTypes.number,
    gain: PropTypes.number,
    priceFirst: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired
};

PriceDisplay.defaultProps = {
    gain: null
};

const StockItem = ({ name, title, price, gainPercent, lastGainPercent, graph, priceFirst, togglePriceFirst }) => (
    <li className={classNames('stocks-list-item', {
        up: gainPercent > 0,
        down: gainPercent < 0,
        'hl-up': lastGainPercent > 0,
        'hl-down': lastGainPercent < 0
    })}>
        <a className="title" title={title}>{name}</a>
        <PriceDisplay price={price} gain={gainPercent} priceFirst={priceFirst} onClick={togglePriceFirst} />
        {graph && <span className="graph">{graph}</span>}
    </li>
);

StockItem.propTypes = {
    name: PropTypes.string.isRequired,
    title: PropTypes.string,
    price: PropTypes.number,
    gainPercent: PropTypes.number,
    lastGainPercent: PropTypes.number,
    graph: dataShape,
    priceFirst: PropTypes.bool.isRequired,
    togglePriceFirst: PropTypes.func.isRequired
};

function StocksList({
    enabled,
    loading,
    stocksList,
    clearList,
    requestList
}) {
    useEffect(() => {
        if (enabled) {
            // setImmediate(requestList);
        } else {
            setImmediate(clearList);
        }

        return clearList;
    }, [enabled, clearList, requestList]);

    const [priceFirst, setPriceFirst] = useState(false);
    const togglePriceFirst = useCallback(() => setPriceFirst(last => !last), []);

    if (!enabled) {
        return null;
    }

    return (
        <div className={classNames('stocks-list', { loading })}>
            <ul className="stocks-list-ul">
                {stocksList.map(item => (
                    <StockItem
                        key={item.name}
                        {...item}
                        priceFirst={priceFirst}
                        togglePriceFirst={togglePriceFirst}
                    />
                ))}
            </ul>
        </div>
    );
}

StocksList.propTypes = {
    enabled: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    stocksList: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        title: PropTypes.string,
        gainPercent: PropTypes.number,
        lastGainPercent: PropTypes.number
    }).isRequired).isRequired,
    clearList: PropTypes.func.isRequired,
    requestList: PropTypes.func.isRequired
};

StocksList.defaultProps = {
    enabled: DO_STOCKS_LIST
};

const mapStateToProps = state => ({
    loading: state.stocks.loading,
    stocksList: getStocksList(state)
});

const mapDispatchToProps = {
    clearList: stocksListCleared,
    requestList: stocksListRequested
};

export default connect(mapStateToProps, mapDispatchToProps)(StocksList);
