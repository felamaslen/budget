function getCategoryColumn(category, grouping) {
    // get database column corresponding to "category" type
    if (category === 'bills') {
        return 'item';
    }

    if (grouping === 'category') {
        if (category === 'food' || category === 'general') {
            return 'category';
        }

        if (category === 'social') {
            return 'society';
        }

        if (category === 'holiday') {
            return 'holiday';
        }

        return 'item';
    }

    if (grouping === 'shop') {
        return 'shop';
    }

    return null;
}

function handler(req, res) {
    return res.end('Analysis data not done yet');
}

module.exports = {
    getCategoryColumn,
    handler
};

