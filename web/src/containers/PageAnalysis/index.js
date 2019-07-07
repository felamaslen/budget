import { connect } from 'react-redux';
import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
    requested,
    blockRequested,
    treeItemDisplayToggled,
    treeItemHovered
} from '~client/actions/analysis';

import {
    getPeriod,
    getGrouping,
    getPage,
    getTreeVisible,
    getCost,
    getBlocks
} from '~client/selectors/analysis';

import { timelineShape, costShape } from '~client/prop-types/page/analysis';
import { blocksShape } from '~client/prop-types/block-packer';

import Page from '~client/components/Page';
import Timeline from '~client/containers/PageAnalysis/timeline';
import Upper from '~client/containers/PageAnalysis/upper';
import ListTree from '~client/containers/PageAnalysis/list-tree';
import BlockPacker from '~client/components/BlockPacker';

import './style.scss';

function PageAnalysis({
    timeline,
    cost,
    blocks,
    period,
    grouping,
    page,
    description,
    treeVisible,
    deepBlock,
    onRequest,
    toggleTreeItem,
    onBlockClick
}) {
    const [activeBlock, setActiveBlock] = useState([null, null]);
    const onBlockHover = useCallback((main, deep = null) => setActiveBlock([main, deep]), []);

    const [treeOpen, setTreeOpen] = useState({});

    useEffect(() => {
        if (!cost) {
            onRequest();
        }
    }, [cost, onRequest]);

    if (!cost) {
        return null;
    }

    return (
        <Page page="analysis">
            <Upper
                period={period}
                grouping={grouping}
                page={page}
                description={description}
                onRequest={onRequest}
            />
            <div className="analysis-outer">
                {timeline && <Timeline data={timeline} />}
                <ListTree
                    cost={cost}
                    treeVisible={treeVisible}
                    toggleTreeItem={toggleTreeItem}
                    treeOpen={treeOpen}
                    setTreeOpen={setTreeOpen}
                    onHover={onBlockHover}
                />
                <BlockPacker
                    blocks={blocks}
                    activeBlock={activeBlock}
                    deep={deepBlock}
                    onHover={onBlockHover}
                    onClick={onBlockClick}
                />
            </div>
        </Page>
    );
}

PageAnalysis.propTypes = {
    timeline: timelineShape,
    cost: costShape,
    blocks: blocksShape,
    period: PropTypes.string.isRequired,
    grouping: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    description: PropTypes.string,
    treeVisible: PropTypes.objectOf(PropTypes.bool.isRequired).isRequired,
    deepBlock: PropTypes.string,
    onBlockClick: PropTypes.func.isRequired,
    onRequest: PropTypes.func.isRequired,
    toggleTreeItem: PropTypes.func.isRequired,
    hoverTreeItem: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    cost: getCost(state),
    blocks: getBlocks(state),
    period: getPeriod(state),
    grouping: getGrouping(state),
    page: getPage(state),
    description: state.analysis.description,
    deepBlock: state.analysis.deepBlock,
    treeVisible: getTreeVisible(state),
    timeline: state.analysis.timeline
});

const mapDispatchToProps = {
    onBlockClick: blockRequested,
    onRequest: requested,
    toggleTreeItem: treeItemDisplayToggled,
    hoverTreeItem: treeItemHovered
};

export default connect(mapStateToProps, mapDispatchToProps)(PageAnalysis);
