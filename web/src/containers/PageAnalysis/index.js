import { connect } from 'react-redux';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';

import { requested, blockRequested, treeItemDisplayToggled } from '~client/actions/analysis';

import {
    getPeriod,
    getGrouping,
    getPage,
    getTreeVisible,
    getCost,
    getDeepCost,
    getBlocks,
    getDeepBlocks,
} from '~client/selectors/analysis';

import { formatCurrency, capitalise } from '~client/modules/format';

import { timelineShape, costShape } from '~client/prop-types/page/analysis';
import { blocksShape } from '~client/prop-types/block-packer';
import { PageContext } from '~client/context';

import Timeline from '~client/containers/PageAnalysis/timeline';
import Upper from '~client/containers/PageAnalysis/upper';
import ListTree from '~client/containers/PageAnalysis/list-tree';
import BlockPacker from '~client/components/BlockPacker';

import * as Styled from './styles';

function PageAnalysis({
    timeline,
    cost,
    costDeep,
    blocks,
    blocksDeep,
    period,
    grouping,
    page,
    description,
    treeVisible,
    onRequest,
    toggleTreeItem,
    onBlockClick,
}) {
    const [activeBlock, setActiveBlock] = useState([null, null]);
    const onHover = useCallback((main, sub = null) => setActiveBlock([main, sub]), []);
    const [activeMain, activeSub] = activeBlock;

    const [treeOpen, setTreeOpen] = useState({});

    useEffect(() => {
        if (!cost) {
            onRequest();
        }
    }, [cost, onRequest]);

    const status = useMemo(() => {
        const activeCost = costDeep || cost;
        if (!(activeCost && activeMain)) {
            return '';
        }

        const main = activeCost.find(({ name }) => name === activeMain);
        if (!main) {
            return '';
        }
        if (activeSub) {
            const { total } = main.subTree.find(({ name }) => name === activeSub);

            return `${capitalise(activeMain)}: ${activeSub} (${formatCurrency(total, {
                raw: true,
            })})`;
        }

        return `${capitalise(activeMain)} (${formatCurrency(main.total, {
            raw: true,
        })})`;
    }, [cost, costDeep, activeMain, activeSub]);

    if (!cost) {
        return null;
    }

    return (
        <PageContext.Provider page="analysis">
            <Styled.Page page="analysis">
                <Upper
                    period={period}
                    grouping={grouping}
                    page={page}
                    description={description}
                    onRequest={onRequest}
                />
                <Styled.Outer>
                    {timeline && <Timeline data={timeline} />}
                    <ListTree
                        cost={cost}
                        treeVisible={treeVisible}
                        toggleTreeItem={toggleTreeItem}
                        treeOpen={treeOpen}
                        setTreeOpen={setTreeOpen}
                        onHover={onHover}
                    />
                    <BlockPacker
                        blocks={blocks}
                        blocksDeep={blocksDeep}
                        activeMain={activeMain}
                        activeSub={activeSub}
                        onHover={onHover}
                        onClick={onBlockClick}
                        status={status}
                    />
                </Styled.Outer>
            </Styled.Page>
        </PageContext.Provider>
    );
}

PageAnalysis.propTypes = {
    timeline: timelineShape,
    cost: costShape,
    costDeep: costShape,
    blocks: blocksShape,
    blocksDeep: blocksShape,
    period: PropTypes.string.isRequired,
    grouping: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    description: PropTypes.string,
    treeVisible: PropTypes.objectOf(PropTypes.bool.isRequired).isRequired,
    onBlockClick: PropTypes.func.isRequired,
    onRequest: PropTypes.func.isRequired,
    toggleTreeItem: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    cost: getCost(state),
    costDeep: getDeepCost(state),
    blocks: getBlocks(state),
    blocksDeep: getDeepBlocks(state),
    period: getPeriod(state),
    grouping: getGrouping(state),
    page: getPage(state),
    description: state.analysis.description,
    treeVisible: getTreeVisible(state),
    timeline: state.analysis.timeline,
});

const mapDispatchToProps = {
    onBlockClick: blockRequested,
    onRequest: requested,
    toggleTreeItem: treeItemDisplayToggled,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(PageAnalysis);
