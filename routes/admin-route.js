import express from 'express';
import productModel from '../models/product-model.js';
import categoryModel from '../models/category-model.js'
import accountModel from '../models/account-model.js'
import {ObjectId} from "mongodb";
import moment from "moment";

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
    const result = await productModel.findById(req.body.id);
    await productModel.deleteProduct(req.body.id);
    await categoryModel.removeProductFromCat(result[0].catParent, result[0].catChild);
    res.redirect(req.headers.referer);
});

router.get('/category', async function (req, res) {
    const limit = 6;
    const page = req.query.page || 1;
    const offset = (page - 1) * limit;
    const total = await categoryModel.countTotalCategory();
    let nPage = Math.floor(total / limit);
    if (total % limit > 0) nPage++;
    const listResult = await categoryModel.getLimitCategory(limit, offset);
    let nexPage = {check: true, value: (+page + 1)};
    let curPage = {check: (+page > 0 && +page <= nPage && listResult.length != 0 ), value: +page};
    let prevPage = {check: true, value: (+page - 1)};
    if (nexPage.value === nPage + 1) nexPage.check = false;
    if (prevPage.value === 0) prevPage.check = false;
    if (total === 0) curPage.check = false;
    res.render('admin/category', {
        layout: 'admin.hbs',
        categoryTab: true,
        listResult,
        nexPage,
        curPage,
        prevPage
    });
});

router.get('/category/add', async function (req, res) {
    const listCategory = await categoryModel.getAll();
    res.render('admin/add-category', {
        layout: 'admin.hbs',
        categoryTab: true,
        listCategory
    });
});

router.post('/category/add', async function (req, res) {
    if (req.body.type === 'child')
        await categoryModel.insertCatChild(req.body.parentId, req.body.name);
    else
        await categoryModel.insertCatParent(req.body.name);
    res.redirect('/admin/category');
});


router.get('/category/:parentId', async function (req, res) {
    const result = await categoryModel.findByID(new ObjectId(req.params.parentId));
    res.render('admin/edit-catParent', {
        layout: 'admin.hbs',
        categoryTab: true,
        edit: true,
        category: result[0]
    });
});

router.post('/category/edit', async function (req, res) {
    await categoryModel.editCatParent(req.body.id, req.body.name);
    res.redirect('/admin/category');
});

router.get('/category/:parentId/:childId/:childName', async function (req, res) {
    const result = await categoryModel.findByID(new ObjectId(req.params.parentId));
    res.render('admin/edit-catChild', {
        layout: 'admin.hbs',
        categoryTab: true,
        edit: true,
        catParent: result[0],
        catChildName: req.params.childName,
        catChildId: req.params.childId
    });
});

router.post('/category/child/edit', async function (req, res) {
    await categoryModel.editCatChild(req.body.parentId, req.body.childId, req.body.name);
    res.redirect('/admin/category');
});

router.post('/category/delete', async function (req, res) {
    await categoryModel.deleteCatParent(req.body.id);
    res.redirect('/admin/category');
});

router.post('/category/child/delete', async function (req, res) {
    await categoryModel.deleteCatChild(req.body.parentId, req.body.childId);
    res.redirect('/admin/category');
});

router.get('/user', async function (req, res) {
    const limit = 6;
    const page = req.query.page || 1;
    const offset = (page - 1) * limit;
    const total = await accountModel.countTotalAccount();
    let nPage = Math.floor(total / limit);
    if (total % limit > 0) nPage++;
    const listResult = await accountModel.getLimitAccount(limit, offset);
    let nexPage = {check: true, value: (+page + 1)};
    let curPage = {check: (+page > 0 && +page <= nPage && listResult.length != 0 ), value: +page};
    let prevPage = {check: true, value: (+page - 1)};
    if (nexPage.value === nPage + 1) nexPage.check = false;
    if (prevPage.value === 0) prevPage.check = false;
    if (total === 0) curPage.check = false;
    for (const item of listResult)
        if (item.role === 'seller')
            item.check = true;
    res.render('admin/user', {
        layout: 'admin.hbs',
        userTab: true,
        upgrade: false,
        listResult,
        nexPage,
        curPage,
        prevPage
    });
});

router.post('/user/lock', async function (req, res) {
    await accountModel.lockAccount(req.body.id);
    res.redirect(req.headers.referer);
});

router.post('/user/downgrade', async function (req, res) {
    await accountModel.downgradeAccount(req.body.id);
    res.redirect(req.headers.referer);
});

router.post('/user/unlock', async function (req, res) {
    await accountModel.unlockAccount(req.body.id);
    res.redirect(req.headers.referer);
});

router.get('/user/upgrade', async function (req, res) {
    const limit = 6;
    const page = req.query.page || 1;
    const offset = (page - 1) * limit;
    const total = await accountModel.countTotalUpgradeList();
    let nPage = Math.floor(total / limit);
    if (total % limit > 0) nPage++;
    const listResult = await accountModel.getLimitUpgradeList(limit,offset);
    let nexPage = {check: true, value: (+page + 1)};
    let curPage = {check: (+page > 0 && +page <= nPage && listResult.length != 0 ), value: +page};
    let prevPage = {check: true, value: (+page - 1)};
    if (nexPage.value === nPage + 1) nexPage.check = false;
    if (prevPage.value === 0) prevPage.check = false;
    if (total === 0) curPage.check = false;
    for (const item of listResult)
        item.dateRequest = moment(item.dateRequest).format('DD/MM/YYYY HH:mm:ss')
    res.render('admin/upgrade', {
        layout: 'admin.hbs',
        userTab: true,
        upgrade: true,
        listResult,
        nexPage,
        curPage,
        prevPage
    });
});

router.get('/user/upgrade/:id', async function (req, res) {

    res.render('admin/upgrade-user', {
        layout: 'admin.hbs',
        userTab: true,
        upgrade: true,
        detail: true,
        id: req.params.id
    });
});

router.post('/user/upgrade', async function (req, res) {
    await accountModel.upgradeAccount(req.body.id);
    await accountModel.deleteUpgradeRequest(req.body.id);
    res.redirect('/admin/user/upgrade');
});

export default router;