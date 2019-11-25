const { catchAsyncErrors, clientError } = require('../../modules/error-handling');

const onDelete = (db) => catchAsyncErrors(async (req, res) => {
    const [item] = await db.select('id')
        .from('net_worth')
        .where('uid', '=', req.user.uid)
        .where('id', '=', req.params.id);

    if (!item) {
        throw clientError('Unknown net worth item', 404);
    }

    await db('net_worth')
        .where('id', '=', req.params.id)
        .delete();

    res.status(204).end();
});

module.exports = {
    onDelete,
};
