import express from 'express';
import productModel from '../models/product-model.js';

const router = express.Router();

router.get('/', async function (req, res) {
    res.render('admin/home', {
        layout: 'admin.hbs',
        homeTab: true,
    });
});
router.get('/product', async function (req, res) {
    const limit = 6;
    const page = req.query.page || 1;
    const offset = (page - 1) * limit;
    const total = await productModel.countTotalProduct();
    let nPage = Math.floor(total / limit);
    if (total % limit > 0) nPage++;
    const listResult = await productModel.getLimitProduct(limit, offset);
    let nexPage = {check: true, value: (+page + 1)};
    let curPage = {check: (+page > 0 && +page <= nPage && listResult.length != 0 ), value: +page};
    let prevPage = {check: true, value: (+page - 1)};
    if (nexPage.value === nPage + 1) nexPage.check = false;
    if (prevPage.value === 0) prevPage.check = false;
    if (total === 0) curPage.check = false;
    res.render('admin/product', {
        layout: 'admin.hbs',
        productTab: true,
        nexPage,
        curPage,
        prevPage,
        listResult
    });
});

router.get('/product/search', async function (req, res) {
    const keyword = req.query.keyword;
    const limit = 6;
    const page = req.query.page || 1;
    const offset = (page - 1) * limit;
    const temp = await productModel.countTotalSearchProduct(keyword, 'name');
    const total = temp[0].total;
    let nPage = Math.floor(total / limit);
    if (total % limit > 0) nPage++;
    const listResult = await productModel.searchByType(keyword, 'name', limit, offset, 'time-descending');
    let nexPage = {check: true, value: (+page + 1)};
    let curPage = {check: (+page > 0 && +page <= nPage && listResult.length != 0 ), value: +page};
    let prevPage = {check: true, value: (+page - 1)};
    if (nexPage.value === nPage + 1) nexPage.check = false;
    if (prevPage.value === 0) prevPage.check = false;
    if (total === 0) curPage.check = false;
    res.render('admin/product', {
        layout: 'admin.hbs',
        productTab: true,
        nexPage,
        curPage,
        prevPage,
        listResult,
        keyword,
    });
});

router.post('/product/delete', async function (req, res) {
    await productModel.deleteProduct(req.body.id);
    res.redirect(req.headers.referer);
});

export default router;