import express from 'express';
import productModel from '../models/product-model.js';
import categoryModel from '../models/category-model.js'
import accountModel from '../models/account-model.js'
import {ObjectId} from "mongodb";
import moment from "moment";
import bcrypt from "bcryptjs";
import entryModel from "../models/entry-model.js";
import randomstring from 'randomstring';
import mailing from "../utils/mailing.js";


const router = express.Router();

router.get('/', async function (req, res) {
    const totalUser = await accountModel.countTotalAccount();
    const totalProduct = await productModel.countTotalProduct();
    const totalUpgrade = await accountModel.countTotalUpgradeList();
    res.render('admin/home', {
        layout: 'admin.hbs',
        homeTab: true,
        totalUser,
        totalProduct,
        totalUpgrade
    });
});


router.get('/product', async function (req, res) {
    const keyword = req.query.keyword;
    const limit = 6;
    const page = req.query.page || 1;
    const offset = (page - 1) * limit;
    let total = 0;
    let listResult;
    if(keyword) {
        const result = await productModel.countTotalSearchProduct(keyword, 'name');
        if(result.length !== 0)
            total = result[0].total;
    }
    else
        total = await productModel.countTotalProduct();
    let nPage = Math.floor(total / limit);
    if (total % limit > 0) nPage++;
    if (keyword)
        listResult = await productModel.searchByType(keyword, 'name', limit, offset, 'time-descending');
    else
        listResult = await productModel.getLimitProduct(limit, offset);
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
        keyword
    });
});

router.post('/product/delete', async function (req, res) {
    const result = await productModel.findById(req.body.id);
    await productModel.deleteProduct(req.body.id);
    await categoryModel.removeProductFromCat(result[0].catParent, result[0].catChild);
    res.redirect(req.headers.referer);
});


router.get('/category', async function (req, res) {
    const keyword = req.query.keyword;
    const limit = 6;
    const page = req.query.page || 1;
    const offset = (page - 1) * limit;
    const total = await categoryModel.countTotalCategory(keyword);
    let nPage = Math.floor(total / limit);
    if (total % limit > 0) nPage++;
    const listResult = await categoryModel.getLimitCategory(limit, offset, keyword);
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
        addCat: true,
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
        category: result[0],
        link: req.headers.referer
    });
});

router.post('/category/edit', async function (req, res) {
    const check = await categoryModel.editCatParent(req.body.id, req.body.name);
    const isEmpty = Object.keys(check).length === 0;
    if (!isEmpty) {
        await productModel.updateCatParent(req.body.catParent, req.body.name);
        return res.redirect('/admin/category');
    }
    res.redirect(req.headers.referer);
});

router.get('/category/:parentId/:childId/:childName', async function (req, res) {
    const result = await categoryModel.findByID(new ObjectId(req.params.parentId));
    res.render('admin/edit-catChild', {
        layout: 'admin.hbs',
        categoryTab: true,
        edit: true,
        catParent: result[0],
        catChildName: req.params.childName,
        catChildId: req.params.childId,
        link: req.headers.referer
    });
});

router.post('/category/child/edit', async function (req, res) {
    const check = await categoryModel.editCatChild(req.body.parentId, req.body.childId, req.body.name);
    const isEmpty = Object.keys(check).length === 0;
    if (!isEmpty) {
        await productModel.updateCatChild(req.body.catParent, req.body.catChild, req.body.name);
        return res.redirect('/admin/category');
    }
    res.redirect(req.headers.referer);
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
    const role = req.query.role;
    const keyword = req.query.keyword;
    const limit = 6;
    const page = req.query.page || 1;
    const offset = (page - 1) * limit;
    const total = await accountModel.countTotalAccount(role, keyword);
    let nPage = Math.floor(total / limit);
    if (total % limit > 0) nPage++;
    const listResult = await accountModel.getLimitAccount(limit, offset, role, keyword);
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
        prevPage,
        role,
        keyword,
    });
});

router.post('/user/downgrade', async function (req, res) {
    await accountModel.downgradeAccount(req.body.id);
    res.redirect(req.headers.referer);
});

/*
router.post('/user/lock', async function (req, res) {
    await accountModel.lockAccount(req.body.id);
    res.redirect(req.headers.referer);
});

router.post('/user/unlock', async function (req, res) {
    await accountModel.unlockAccount(req.body.id);
    res.redirect(req.headers.referer);
});
*/

router.post('/user/delete', async function (req, res) {
    await accountModel.deleteAccount(req.body.id);
    res.redirect(req.headers.referer);
});

router.post('/user/reset', async function (req, res) {
    const random = randomstring.generate(10);
    const salt = bcrypt.genSaltSync(10);
    const result = await entryModel.changePassword(req.body.id, bcrypt.hashSync(random, salt));
    if (result.modifiedCount === 1)
        await mailing.sendEmail(req.body.email, 'Th??ng b??o t??i kho???n ???? ???????c ?????t l???i', `T??i kho???n c???a b???n tr??n website Online Auction ???? ???????c Admin ?????t l???i m???t kh???u. M???t kh???u m???i l??:\n${random}\nXin c???m ??n.`);
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
        item.date = moment(item.date).format('DD/MM/YYYY HH:mm:ss')
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
    const result = await accountModel.getInforBidderAccount(req.params.id);
    let score = Math.ceil(result.goodScore / (result.goodScore + result.badScore) * 100);
    if (isNaN(score))
        score = 0;
    const totalBid = await accountModel.getTotalBid(req.params.id);
    const total = await accountModel.getTotalProduct(req.params.id);
    res.render('admin/upgrade-user', {
        layout: 'admin.hbs',
        userTab: true,
        upgrade: true,
        detail: true,
        id: req.params.id,
        score,
        total,
        totalBid
    });
});

router.post('/user/upgrade', async function (req, res) {
    await accountModel.upgradeAccount(req.body.id);
    await accountModel.deleteUpgradeRequest(req.body.id);
    res.redirect('/admin/user/upgrade');
});

router.get('/user/add', async function (req, res) {
    res.render('admin/add-user', {
        layout: 'admin.hbs',
        userTab: true,
        add: true,
    });
});

router.post('/user/add', async function (req, res) {
    const salt = bcrypt.genSaltSync(10);
    let account = {
        email: req.body.email,
        name: req.body.name,
        address: req.body.address,
        pass: bcrypt.hashSync(req.body.pass, salt),
        role: req.body.type,
        badScore: 0,
        goodScore: 0,
        verified: true
    };
    await entryModel.addAccount(account);
    res.redirect('/admin/user');
});


export default router;