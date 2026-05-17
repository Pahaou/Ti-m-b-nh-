const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const SORT_WHITELIST = {
    default: 'p.is_best_seller DESC, p.created_at DESC',
    'price-asc': 'p.base_price ASC, p.id ASC',
    'price-desc': 'p.base_price DESC, p.id ASC',
    name: 'p.name ASC, p.id ASC',
    rating: 'COALESCE(rstats.avg_rating, 0) DESC, p.id ASC',
    popular: 'COALESCE(rstats.review_count, 0) DESC, p.is_best_seller DESC, p.id ASC',
};

function parseIntParam(v, fallback, min, max) {
    const n = parseInt(String(v), 10);
    if (Number.isNaN(n)) return fallback;
    return Math.min(max, Math.max(min, n));
}

function parseOptionalCategoryId(v) {
    if (v == null || v === '') return null;
    const n = parseInt(String(v), 10);
    if (Number.isNaN(n) || n < 1) return null;
    return Math.min(999999, n);
}

// 1. Danh sách sản phẩm (public): pagination, search, filter, sort
exports.getAllProducts = asyncHandler(async (req, res) => {
    const page = parseIntParam(req.query.page, 1, 1, 10000);
    const pageSize = parseIntParam(req.query.limit || req.query.pageSize, 12, 1, 48);
    const offset = (page - 1) * pageSize;
    const q = req.query.q != null ? String(req.query.q).trim() : '';
    const categoryId = parseOptionalCategoryId(req.query.categoryId);
    const minPrice = req.query.minPrice != null && req.query.minPrice !== ''
        ? parseFloat(req.query.minPrice)
        : null;
    const maxPrice = req.query.maxPrice != null && req.query.maxPrice !== ''
        ? parseFloat(req.query.maxPrice)
        : null;
    const bestSeller = ['1', 'true', 'yes'].includes(String(req.query.bestSeller || '').toLowerCase());
    const sortKey = SORT_WHITELIST[req.query.sort] ? req.query.sort : 'default';
    const orderClause = SORT_WHITELIST[sortKey];

    const conditions = ['p.deleted_at IS NULL'];
    const params = [];

    if (q.length > 0) {
        conditions.push('p.name LIKE ?');
        params.push(`%${q.slice(0, 200)}%`);
    }
    if (categoryId !== null) {
        conditions.push('p.category_id = ?');
        params.push(categoryId);
    }
    if (minPrice !== null && !Number.isNaN(minPrice) && minPrice >= 0) {
        conditions.push('p.base_price >= ?');
        params.push(minPrice);
    }
    if (maxPrice !== null && !Number.isNaN(maxPrice) && maxPrice >= 0) {
        conditions.push('p.base_price <= ?');
        params.push(maxPrice);
    }
    if (bestSeller) {
        conditions.push('(p.is_best_seller = 1 OR p.is_best_seller = TRUE)');
    }

    const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const baseFrom = `
        FROM Products p
        JOIN Categories c ON p.category_id = c.id
        LEFT JOIN Product_Images pi ON pi.product_id = p.id AND (pi.is_thumbnail = 1 OR pi.is_thumbnail = TRUE)
        LEFT JOIN (
            SELECT product_id,
                   AVG(rating) AS avg_rating,
                   COUNT(*) AS review_count
            FROM Reviews
            GROUP BY product_id
        ) rstats ON rstats.product_id = p.id
        ${whereSql}
    `;

    const countSql = `SELECT COUNT(DISTINCT p.id) AS total ${baseFrom}`;
    const [[{ total }]] = await db.query(countSql, params);

    const listSql = `
        SELECT
            p.id, p.name, p.base_price, p.description, p.is_best_seller, p.created_at,
            c.id AS category_id, c.name AS category_name, c.is_defect AS category_is_defect,
            pi.image_url AS thumbnail,
            COALESCE(rstats.avg_rating, 0) AS avg_rating,
            COALESCE(rstats.review_count, 0) AS review_count
        ${baseFrom}
        ORDER BY ${orderClause}
        LIMIT ${Number(pageSize)} OFFSET ${Number(offset)}
    `;
    const [products] = await db.query(listSql, params);

    res.json({
        success: true,
        data: products,
        meta: {
            page,
            pageSize,
            total: Number(total),
            totalPages: Math.max(1, Math.ceil(Number(total) / pageSize)),
        },
    });
});

// 2. Lấy chi tiết sản phẩm (public)
exports.getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const [products] = await db.query(`
        SELECT p.*, c.name AS category_name
        FROM Products p
        JOIN Categories c ON p.category_id = c.id
        WHERE p.id = ? AND p.deleted_at IS NULL
    `, [id]);

    if (products.length === 0) {
        throw new AppError('Không tìm thấy sản phẩm', 404);
    }

    const [images] = await db.query('SELECT * FROM Product_Images WHERE product_id = ?', [id]);
    const [variants] = await db.query('SELECT * FROM Product_Variants WHERE product_id = ?', [id]);
    const [reviews] = await db.query(`
        SELECT r.*, u.fullname
        FROM Reviews r
        JOIN Users u ON r.user_id = u.id
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC
    `, [id]);
    const [related] = await db.query(`
        SELECT p.id, p.name, p.base_price, pi.image_url AS thumbnail
        FROM Products p
        LEFT JOIN Product_Images pi ON pi.product_id = p.id AND pi.is_thumbnail = TRUE
        WHERE p.category_id = ? AND p.id != ? AND p.deleted_at IS NULL
        LIMIT 4
    `, [products[0].category_id, id]);

    res.json({
        success: true,
        data: {
            ...products[0],
            images,
            variants,
            reviews,
            related,
            avg_rating: reviews.length > 0
                ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
                : 0,
        },
    });
});

// 3. Gợi ý: bán chạy + cùng danh mục (query params: limit, categoryId optional)
exports.getSuggestions = asyncHandler(async (req, res) => {
    const limit = parseIntParam(req.query.limit, 8, 1, 24);
    const categoryId = parseOptionalCategoryId(req.query.categoryId);

    const params = [];
    let catFilter = '';
    if (categoryId !== null) {
        catFilter = 'AND p.category_id = ?';
        params.push(categoryId);
    }
    params.push(limit);

    const [rows] = await db.query(`
        SELECT
            p.id, p.name, p.base_price, p.is_best_seller,
            c.id AS category_id, c.name AS category_name, c.is_defect AS category_is_defect,
            pi.image_url AS thumbnail,
            COALESCE(SUM(oi.quantity), 0) AS sold_score
        FROM Products p
        JOIN Categories c ON p.category_id = c.id
        LEFT JOIN Product_Images pi ON pi.product_id = p.id AND pi.is_thumbnail = TRUE
        LEFT JOIN Order_Items oi ON oi.product_id = p.id
        LEFT JOIN Orders o ON o.id = oi.order_id AND o.status NOT IN ('cancelled')
        WHERE p.deleted_at IS NULL ${catFilter}
        GROUP BY p.id, p.name, p.base_price, p.is_best_seller, c.id, c.name, pi.image_url
        ORDER BY sold_score DESC, p.is_best_seller DESC, p.created_at DESC
        LIMIT ?
    `, params);

    res.json({ success: true, data: rows });
});

// 4. Lấy danh sách danh mục (public)
exports.getCategories = asyncHandler(async (req, res) => {
    const [categories] = await db.query(`
        SELECT c.*, COUNT(p.id) AS product_count
        FROM Categories c
        LEFT JOIN Products p ON p.category_id = c.id AND p.deleted_at IS NULL
        WHERE c.is_active = TRUE
        GROUP BY c.id
    `);

    res.json({ success: true, data: categories });
});
