import { connect } from 'react-redux';
import React, {
    useState, useCallback, useMemo, useEffect,
} from 'react';
import PropTypes from 'prop-types';

import {
    requested,
    blockRequested,
    treeItemDisplayToggled,
    treeItemHovered,
} from '~client/actions/analysis';

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
    deepBlockName,
    deepCost,
    deepBlocks,
    onRequest,
    toggleTreeItem,
    onBlockClick,
}) {
    const [activeBlock, setActiveBlock] = useState([null, null]);
    const onBlockHover = useCallback((main, deep = null) => setActiveBlock([main, deep]), []);

    const [treeOpen, setTreeOpen] = useState({});

    useEffect(() => {
        if (!cost) {
            onRequest();
        }
    }, [cost, onRequest]);

    const status = useMemo(() => {
        const [activeMain, activeSub] = activeBlock;
        const activeCost = deepCost || cost;

        if (!(activeCost && activeMain)) {
            return '';
        }

        const main = activeCost.find(({ name }) => name === activeMain);
        if (!main) {
            return '';
        }
        if (activeSub) {
            const { total } = main.subTree.find(({ name }) => name === activeSub);

            return `${capitalise(activeMain)}: ${activeSub} (${formatCurrency(total, { raw: true })})`;
        }

        return `${capitalise(activeMain)} (${formatCurrency(main.total, { raw: true })})`;
    }, [cost, deepCost, activeBlock]);

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
                    blocks={deepBlocks || blocks}
                    activeMain={activeBlock[0]}
                    activeSub={activeBlock[1]}
                    deepBlock={deepBlockName}
                    onHover={onBlockHover}
                    onClick={onBlockClick}
                    status={status}
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
    deepBlockName: PropTypes.string,
    deepCost: costShape,
    deepBlocks: blocksShape,
    onBlockClick: PropTypes.func.isRequired,
    onRequest: PropTypes.func.isRequired,
    toggleTreeItem: PropTypes.func.isRequired,
    hoverTreeItem: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
    cost: getCost(state),
    blocks: getBlocks(state),
    period: getPeriod(state),
    grouping: getGrouping(state),
    page: getPage(state),
    description: state.analysis.description,
    deepBlockName: state.analysis.deepBlock,
    deepCost: getDeepCost(state),
    deepBlocks: getDeepBlocks(state),
    treeVisible: getTreeVisible(state),
    timeline: state.analysis.timeline,
});

const mapDispatchToProps = {
    onBlockClick: blockRequested,
    onRequest: requested,
    toggleTreeItem: treeItemDisplayToggled,
    hoverTreeItem: treeItemHovered,
};

export default connect(mapStateToProps, mapDispatchToProps)(PageAnalysis);
