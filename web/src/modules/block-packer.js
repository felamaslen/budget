import compose from 'just-compose';

import { percent } from '~client/modules/format';

const numBlockColors = 16;

function worst(row, node) {
    if (row.length === 0) {
        return Infinity;
    }

    const nodeAspect = node.width / node.height;

    const totalArea = row.reduce((sum, area) => sum + area, 0);

    if (nodeAspect > 1) {
        // wide, so fill the node from the left
        const rowWidth = totalArea / node.height;

        return row.reduce((worstAspect, area) => {
            const thisAspect = rowWidth * rowWidth / area;
            const thisWorst = Math.max(thisAspect, 1 / thisAspect);

            if (thisWorst > worstAspect) {
                return thisWorst;
            }

            return worstAspect;
        }, 0);
    }

    // tall, so fill the node from the bottom
    const rowHeight = totalArea / node.width;

    // calculate the worst aspect ratio possible in the row
    return row.reduce((worstAspect, area) => {
        const thisAspect = area / (rowHeight * rowHeight);
        const thisWorst = Math.max(thisAspect, 1 / thisAspect);

        if (thisWorst > worstAspect) {
            return thisWorst;
        }

        return worstAspect;
    }, 0);
}

const landscape = node => node.width > node.height;

function getBlockWidth(node, blockArea) {
    if (landscape(node)) {
        return blockArea / node.height;
    }

    return node.width;
}

function getBlockHeight(node, blockArea) {
    if (landscape(node)) {
        return node.height;
    }

    return blockArea / node.width;
}

function getNodeX(node, blockWidth) {
    if (landscape(node)) {
        return node.xPos + blockWidth;
    }

    return node.xPos;
}

function getNodeY(node, blockHeight) {
    if (landscape(node)) {
        return node.yPos;
    }

    return node.yPos + blockHeight;
}

function getNodeWidth(node, blockWidth) {
    if (landscape(node)) {
        return node.width - blockWidth;
    }

    return node.width;
}

function getNodeHeight(node, blockHeight) {
    if (landscape(node)) {
        return node.height;
    }

    return node.height - blockHeight;
}

function getNewNode(row, node) {
    const blockArea = row.reduce((sum, area) => sum + area, 0);

    const blockWidth = getBlockWidth(node, blockArea);
    const blockHeight = getBlockHeight(node, blockArea);

    return {
        xPos: getNodeX(node, blockWidth),
        yPos: getNodeY(node, blockHeight),
        width: getNodeWidth(node, blockWidth),
        height: getNodeHeight(node, blockHeight)
    };
}

function makeGetBlockDimensions(node, blockArea) {
    if (landscape(node)) {
        return value => ([1, value / blockArea]);
    }

    return value => ([value / blockArea, 1]);
}

function getBlockBits(params, dimensions, node, rowCount) {
    const { data, colorOffset } = params;
    const { blockArea, blockWidth, blockHeight } = dimensions;

    const getBlockDimensions = makeGetBlockDimensions(node, blockArea);

    return (value, index) => {
        const [thisBlockWidth, thisBlockHeight] = getBlockDimensions(value);

        const { name, total, subTree } = data[rowCount + index];

        const newBlockBit = {
            width: percent(thisBlockWidth),
            height: percent(thisBlockHeight),
            name,
            color: (rowCount + index + colorOffset) % numBlockColors,
            value: total
        };

        if (subTree) {
            // eslint-disable-next-line no-use-before-define
            const thisBlocks = blockPacker(subTree, thisBlockWidth * blockWidth, thisBlockHeight * blockHeight);

            return { ...newBlockBit, blocks: thisBlocks };
        }

        return newBlockBit;
    };
}

function getNewBlock(params, row, node, rowCount) {
    const { width, height } = params;
    const blockArea = row.reduce((sum, area) => sum + area, 0);

    const blockWidth = getBlockWidth(node, blockArea);
    const blockHeight = getBlockHeight(node, blockArea);

    const dimensions = { blockArea, blockWidth, blockHeight };

    const newBlockBits = row.map(getBlockBits(params, dimensions, node, rowCount));

    return {
        width: percent(blockWidth / width),
        height: percent(blockHeight / height),
        bits: newBlockBits
    };
}

function squarify(params, blocks, rowCount, children, row, node) {
    if (!children.length) {
        return blocks;
    }

    if (children.length === 1 && row.length === 0) {
        const newBlock = getNewBlock(params, children, node, rowCount);

        return blocks.concat([newBlock]);
    }

    const rowWithFirstChild = row.concat(children.slice(0, 1));

    if (worst(row, node) >= worst(rowWithFirstChild, node)) {
        return squarify(params, blocks, rowCount, children.slice(1), rowWithFirstChild, node);
    }

    const newBlock = getNewBlock(params, row, node, rowCount);
    const newNode = getNewNode(row, node);

    return squarify(params, blocks.concat([newBlock]), rowCount + row.length, children, [], newNode);
}

function rowTotal(row) {
    if (row.subTree) {
        return row.subTree.reduce((sum, subRow) => sum + rowTotal(subRow), 0);
    }

    return row.total || 0;
}

const withTotals = rows => rows.map(row => ({ ...row, total: rowTotal(row) }));

const withPositiveTotals = rows => rows.filter(({ total }) => total > 0);

export function blockPacker(rows, width, height) {
    const data = compose(
        withTotals,
        withPositiveTotals
    )(rows);

    const colorOffset = data.reduce((sum, { total }) => sum + (total & 1), 0);

    const totalAll = data.reduce((sum, { total }) => sum + total, 0);

    const totalArea = width * height;

    const children = data.map(({ total }) => total * totalArea / totalAll);

    const blocks = [];

    const root = {
        xPos: 0,
        yPos: 0,
        width,
        height
    };

    const row = [];
    const rowCount = 0;

    const params = { data, width, height, colorOffset };

    return squarify(params, blocks, rowCount, children, row, root);
}
