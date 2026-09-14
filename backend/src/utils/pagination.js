function getPagination(query = {}, { defaultLimit = 50, maxLimit = 100 } = {}) {
    const paginate = query.page !== undefined || query.limit !== undefined;
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const requested = parseInt(query.limit, 10);
    const limit = Math.min(Math.max(requested || defaultLimit, 1), maxLimit);
    const skip = (page - 1) * limit;
    return { page, limit, skip, paginate };
}

module.exports = { getPagination };
