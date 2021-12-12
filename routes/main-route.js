import express from 'express';
import productModel from '../models/product-model.js';
import moment from 'moment';

const router = express.Router();

router.get('/product/:id', async function (req, res) {
    const proID = req.params.id;
    const proInfo = await productModel.findByID(proID);
    if(typeof (proInfo) === 'undefined')
        res.redirect('/');
    else {
        const proSame = await productModel.findByCategory(proInfo[0].proType);
        res.render('detail', {
            proInfo,
            proSame
        });
    }
});
router.get('/', async function (req, res) {
    let now = new Date();
    const proNearEnd = await productModel.findNearEnd(now);
    const proMostBid = await productModel.findMostBid(now);
    const proHighestPrice = await productModel.findHighestPrice(now);
    for (let i = 0; i < proNearEnd.length; i++) {
        proNearEnd[i].proStartDate = moment(proNearEnd[i].proStartDate).format('DD/MM/YYYY')
        proNearEnd[i].time = Math.ceil(Math.abs(proNearEnd[i].proEndDate - now) / (1000 * 60 * 60));
        proMostBid[i].proStartDate = moment(proMostBid[i].proStartDate).format('DD/MM/YYYY')
        proMostBid[i].time = Math.ceil(Math.abs(proMostBid[i].proEndDate - now) / (1000 * 60 * 60));
        proHighestPrice[i].proStartDate = moment(proHighestPrice[i].proStartDate).format('DD/MM/YYYY')
        proHighestPrice[i].time = Math.ceil(Math.abs(proHighestPrice[i].proEndDate - now) / (1000 * 60 * 60));
    }
    now = moment(now).format('DD/MM/YYYY HH:mm:ss')
    res.render('home', {
        now,
        proNearEnd,
        proMostBid,
        proHighestPrice
    });
});
router.get('/search', async function (req, res) {
    const keyword = req.query.keyword;
    const type = req.query.with;
    const limit = 9;
    const page = req.query.page || 1;
    const offset = (page - 1) * limit;
    //console.log(await productModel.countProduct());
    const total = await productModel.countProduct();
    let nPage = Math.floor(total / limit);
    if (total % limit > 0) nPage++;
    const proResult = await productModel.searchByType(keyword, type, limit, offset);
    //console.log(proResult);
    let nexPage = {check: true, value: (+page + 1)};
    let curPage = {check: (+page > 0 && +page <= nPage), value: +page};
    let prevPage = {check: true, value: (+page - 1)};
    if (nexPage.value === nPage + 1) nexPage.check = false;
    if (prevPage.value === 0) prevPage.check = false;
    for (const item of proResult) {
        item.time = Math.ceil(Math.abs(item.proEndDate - new Date()) / (1000 * 60 * 60));
        item.proStartDate = moment(item.proStartDate).format('DD/MM/YYYY')
    }
    res.render('search', {
        keyword,
        type,
        nexPage,
        curPage,
        prevPage,
        proResult
    });
});
router.get('/signup', function (req, res) {
    res.render('signup');
});

export default router;