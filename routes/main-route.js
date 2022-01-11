import express from 'express';
import productModel from '../models/product-model.js';
import moment from 'moment';
import mailing from "../utils/mailing.js";
import entryModel from '../models/entry-model.js'
import bcrypt from 'bcryptjs';
import randomstring from 'randomstring';
import fs from 'fs'

const router = express.Router();

router.get('/product/:id', async function (req, res) {
    const id = req.params.id;
    const proInfo = await productModel.findById(id);
    const proHistoryBid = await productModel.getBidderHistoryWithProID(id)

    const historyList = []

    for(let i = 0; i < proHistoryBid.length; i++){
        if(i === 4)
            break
        proHistoryBid[i].dateBid = moment(proHistoryBid[i].dateBid).format('DD/MM/YYYY HH:mm')
        var mask = proHistoryBid[i].sellerInfo[0].name

        proHistoryBid[i].sellerInfo = mask.replace(/\D(?=\D{4})/g, "*");
        historyList.push(proHistoryBid[i])
    }

    let files = null;
    let mainThumb = null;
    try{
        files = fs.readdirSync(`./public/${id}/`);
        mainThumb = files[0];
        files.splice(0, 1);
    } catch (e){
        console.log(e);
    }

    console.log(proHistoryBid)
    if(typeof (proInfo) === 'undefined')
        res.redirect('/');
    else {
        const listSimilarity = await productModel.findByCategoryParent(proInfo[0].catParent, 5);
        res.render('detail', {
            proInfo,
            listSimilarity,
            historyList,
            files,
            mainThumb
        });
    }
});

router.get('/product', async function (req, res) {
    const category = req.query.category;
    let product = false;
    let by = false;
    const limit = 9;
    const page = req.query.page || 1;
    const offset = (page - 1) * limit;
    let total = 0;
    if (category)
        total = await productModel.countTotalCategoryProduct(category);
    else
        total = await productModel.countTotalProduct();
    let nPage = Math.floor(total / limit);
    if (total % limit > 0) nPage++;
    let listResult;
    if (category) {
        listResult = await productModel.getLimitCategoryProduct(limit, offset, category);
        by = true;
    }
    else {
        listResult = await productModel.getLimitProduct(limit, offset);
        product = true
    }
    let nexPage = {check: true, value: (+page + 1)};
    let curPage = {check: (+page > 0 && +page <= nPage && listResult.length != 0 ), value: +page};
    let prevPage = {check: true, value: (+page - 1)};
    if (nexPage.value === nPage + 1) nexPage.check = false;
    if (prevPage.value === 0) prevPage.check = false;
    if (total === 0) curPage.check = false;
    for (const item of listResult) {
        item.time = (item.proEndDate - new Date()) / (1000 * 60 * 60);
        item.check = (new Date() - item.proStartDate) / (1000 * 60) <= 30 && (new Date() - item.proStartDate) / (1000 * 60) > 0;
        item.proStartDate = moment(item.proStartDate).format('DD/MM/YYYY');
        if (item.time <= 0)
            item.check1 = true;
        else
            item.check1 = false;
        try{
            const files = fs.readdirSync(`./public/${item._id}/`);
            const mainThumb = files[0];
            item.mainThumb = mainThumb;
        } catch(e){
            console.log(e)
        }
    }


    res.render('search', {
        nexPage,
        curPage,
        prevPage,
        listResult,
        product,
        by,
        category
    });
});

router.get('/', async function (req, res) {
    let now = new Date();
    const listExpiration = await productModel.findTopExpiration(now);
    const listMostBid = await productModel.findTopBid(now);
    const listTopPrice = await productModel.findTopPrice(now);
    let files = null;
    let mainThumb = null;
    for (let i = 0; i < listExpiration.length; i++) {
        listExpiration[i].proStartDate = moment(listExpiration[i].proStartDate).format('DD/MM/YYYY')
        listExpiration[i].time = (listExpiration[i].proEndDate - now) / (1000 * 60 * 60);
        try{
            files = fs.readdirSync(`./public/${listExpiration[i]._id}/`);
            mainThumb = files[0];
            listExpiration[i].mainThumb = mainThumb
        } catch(e){
            console.log(e);
        }
        listMostBid[i].proStartDate = moment(listMostBid[i].proStartDate).format('DD/MM/YYYY')
        listMostBid[i].time = (listMostBid[i].proEndDate - now) / (1000 * 60 * 60);
        try{
            files = fs.readdirSync(`./public/${listMostBid[i]._id}/`);
            mainThumb = files[0];
            listMostBid[i].mainThumb = mainThumb
        } catch(e){
            console.log(e);
        }


        listTopPrice[i].proStartDate = moment(listTopPrice[i].proStartDate).format('DD/MM/YYYY')
        listTopPrice[i].time = (listTopPrice[i].proEndDate - now) / (1000 * 60 * 60);
        try{
            files = fs.readdirSync(`./public/${listTopPrice[i]._id}/`);
            mainThumb = files[0];
            listTopPrice[i].mainThumb = mainThumb
        } catch(e){
            console.log(e);
        }
    }
    now = moment(now).format('DD/MM/YYYY HH:mm:ss')
    res.render('home', {
        now,
        listExpiration,
        listMostBid,
        listTopPrice,
        auth: req.session.auth
    });
});
router.get('/search', async function (req, res) {
    const sort = req.query.sort || 'price-ascending';
    let sortType = false;
    if(sort === 'price-ascending') sortType = true;
    const keyword = req.query.keyword;
    const type = req.query.with;
    let total = 0;
    const limit = 9;
    const page = req.query.page || 1;
    const offset = (page - 1) * limit;
    const result = await productModel.countTotalSearchProduct(keyword, type);
    if(result.length !== 0)
        total = result[0].total;
    let nPage = Math.floor(total / limit);
    if (total % limit > 0) nPage++;
    const listResult = await productModel.searchByType(keyword, type, limit, offset, sort);
    let nexPage = {check: true, value: (+page + 1)};
    let curPage = {check: (+page > 0 && +page <= nPage && listResult.length != 0 ), value: +page};
    let prevPage = {check: true, value: (+page - 1)};
    if (nexPage.value === nPage + 1) nexPage.check = false;
    if (prevPage.value === 0) prevPage.check = false;
    if (total === 0) curPage.check = false;
    for (const item of listResult) {
        item.time = (item.proEndDate - new Date()) / (1000 * 60 * 60);
        item.check = (new Date() - item.proStartDate) / (1000 * 60) <= 30 && (new Date() - item.proStartDate) / (1000 * 60) > 0;
        item.proStartDate = moment(item.proStartDate).format('DD/MM/YYYY');
        if (item.time <= 0)
            item.check1 = true;
        else
            item.check1 = false;
        try{
            const files = fs.readdirSync(`./public/${item._id}/`);
            const mainThumb = files[0];
            item.mainThumb = mainThumb;
        } catch(e){
            console.log(e)
        }
    }
    res.render('search', {
        sortType,
        keyword,
        type,
        nexPage,
        curPage,
        prevPage,
        listResult
    });
});
router.get('/signup', function (req, res) {
    res.render('signup', {
        layout: 'navbar.hbs',
    });
});
router.post('/signup', async function (req, res) {
    const salt = bcrypt.genSaltSync(10);
    let account = {
        email: req.body.email,
        name: req.body.name,
        address: req.body.address,
        pass: bcrypt.hashSync(req.body.pass, salt),
        role: 'bidder',
        badScore: 0,
        goodScore: 0,
        verified: false
    };
    const id = await entryModel.addAccount(account);
    await mailing.sendEmail(account.email, 'Xác minh tài khoản', `Để xác minh tài khoản ở website của chúng tôi, bạn vui lòng nhấn vào đường link ở bên dưới:\nhttp://localhost:3000/verify/${randomstring.generate(70)}/${id.toString()}\nXin cảm ơn.`);
    res.redirect('/login');
});

router.get('/verify/:random/:id', async function (req, res) {
    await entryModel.verifyAccount(req.params.id);
    res.redirect('/login');
});

router.get('/login', async function (req, res) {
    res.render('signin', {
        layout: 'navbar.hbs',
    });
});

router.post('/login', async function (req, res) {
    const user = {
        email: req.body.email,
        verified: true
    };
    const account = await entryModel.loginAccount(user, req.body.pass);
    if (account.length != 0) {
        req.session.auth = true;
        req.session.user = account;
        res.redirect(req.session.retUrl || '/');
    }
    else {
        res.render('signin', {
            layout: 'navbar.hbs',
            err_msg: 'Invalid email or password!'
        });
    }
});

router.post('/account/logout',  async function (req, res) {
    req.session.auth = false;
    req.session.user = null;
    req.session.retUrl = '/';
    res.redirect(req.headers.referer);
});

router.get('/account', async function (req, res) {
    const account = await entryModel.checkAccount(req.query.email);
    if (account.length === 0)
        return res.json(true);
    return res.json(false);
});

router.get('/forget-password', async function (req, res) {
    res.render('forget-password-1', {
        layout: 'navbar.hbs',
    });
});

router.post('/forget-password', async function (req, res) {
    const result = await entryModel.checkAccount(req.body.email);
    const id = result[0]._id;
    await mailing.sendEmail(req.body.email, 'Quên mật khẩu', `Bạn đã yêu cầu thay đổi mật khẩu, xin vui lòng truy cập vào đường link ở bên dưới để tiến hành thay đổi mật khẩu:\nhttp://localhost:3000/change/${randomstring.generate(70)}/${id.toString()}\nXin cảm ơn.`);
    res.redirect('/');
});

router.get('/change/:random/:id', async function (req, res) {
    res.render('forget-password-2', {
        id: req.params.id,
        layout: 'navbar.hbs',
    });
});

router.post('/change', async function (req, res) {
    const salt = bcrypt.genSaltSync(10);
    await entryModel.changePassword(req.body.id, bcrypt.hashSync(req.body.pass, salt));
    res.redirect('/login');
});

export default router;