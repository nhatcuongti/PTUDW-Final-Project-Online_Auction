import express from 'express';
import productModel from '../models/product-model.js';
import categoryModel from '../models/category-model.js'
import {ObjectId} from "mongodb";

const router = express.Router();

router.get('/', async function (req, res) {
    res.render('admin/home', {
        layout: 'admin.hbs',
        homeTab: true,
    });
    //await categoryModel.insertCatParent('Phu kien');
    //await categoryModel.insertCatChild('61c9bd7832c892825d51291f', 'Day sac');
    //console.log(await categoryModel.deleteCatChild('61c97f5a913f14bbfb9f125e','61c989ebb5143730160fdd40'));
    //console.log(await categoryModel.editCatChild('61c97f5a913f14bbfb9f125e', '61c9910332b268f6076fc098','Hello'));
    //console.log(await categoryModel.editCatParent('61c97f5a913f14bbfb9f125e', 'hello'))
    //console.log(await categoryModel.deleteCatParent('61c97f5a913f14bbfb9f125e'))
    //console.log(await categoryModel.getAll());
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

router.get('/category', async function (req, res) {
    const listCategory = await categoryModel.getAll();
    res.render('admin/category', {
        layout: 'admin.hbs',
        categoryTab: true,
        listCategory
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

export default router;