import express from 'express';
import productModel from '../models/product-model.js';
import moment from 'moment';
import mailing from "../utils/mailing.js";

const router = express.Router();

router.get('/product/:id', async function (req, res) {
    const id = req.params.id;
    const proInfo = await productModel.findById(id);
    if(typeof (proInfo) === 'undefined')
        res.redirect('/');
    else {
        const listSimilarity = await productModel.findByCategory(proInfo[0].proType);
        res.render('detail', {
            proInfo,
            listSimilarity
        });
    }
});
router.get('/', async function (req, res) {
    let now = new Date();
    const listExpiration = await productModel.findTopExpiration(now);
    const listMostBid = await productModel.findTopBid(now);
    const listTopPrice = await productModel.findTopPrice(now);
    for (let i = 0; i < listExpiration.length; i++) {
        listExpiration[i].proStartDate = moment(listExpiration[i].proStartDate).format('DD/MM/YYYY')
        listExpiration[i].time = Math.ceil(Math.abs(listExpiration[i].proEndDate - now) / (1000 * 60 * 60));
        listMostBid[i].proStartDate = moment(listMostBid[i].proStartDate).format('DD/MM/YYYY')
        listMostBid[i].time = Math.ceil(Math.abs(listMostBid[i].proEndDate - now) / (1000 * 60 * 60));
        listTopPrice[i].proStartDate = moment(listTopPrice[i].proStartDate).format('DD/MM/YYYY')
        listTopPrice[i].time = Math.ceil(Math.abs(listTopPrice[i].proEndDate - now) / (1000 * 60 * 60));
    }
    now = moment(now).format('DD/MM/YYYY HH:mm:ss')
    res.render('home', {
        now,
        listExpiration,
        listMostBid,
        listTopPrice
    });
});
router.get('/search', async function (req, res) {
    const keyword = req.query.keyword;
    const type = req.query.with;
    const limit = 9;
    const page = req.query.page || 1;
    const offset = (page - 1) * limit;
    const total = await productModel.countTotalProduct();
    let nPage = Math.floor(total / limit);
    if (total % limit > 0) nPage++;
    const listResult = await productModel.searchByType(keyword, type, limit, offset);
    let nexPage = {check: true, value: (+page + 1)};
    let curPage = {check: (+page > 0 && +page <= nPage && listResult.length != 0 ), value: +page};
    let prevPage = {check: true, value: (+page - 1)};
    if (nexPage.value === nPage + 1) nexPage.check = false;
    if (prevPage.value === 0) prevPage.check = false;
    if (total === 0) curPage.check = false;
    for (const item of listResult) {
        item.time = Math.ceil(Math.abs(item.proEndDate - new Date()) / (1000 * 60 * 60));
        item.check = Math.ceil(Math.abs(new Date() - item.proStartDate) / (1000 * 60)) <= 30;
        item.proStartDate = moment(item.proStartDate).format('DD/MM/YYYY');
    }
    res.render('search', {
        keyword,
        type,
        nexPage,
        curPage,
        prevPage,
        listResult
    });
});
router.get('/signup', function (req, res) {
    res.render('signup');
});

export default router;