import express from 'express';
import findAll from "../models/account-model.js";

const router = express.Router();

router.get('/favorite',  function (req, res) {
    let list = findAll();
    res.render('viewAccount/favorite', {
        product: list
    });
});

router.get('/auction-history',  function (req, res) {
    let list = findAll.findAll();
    res.render('viewAccount/viewHistory/auction-history',{
        product:list
    });
});
router.get('/auction-already-history',  function (req, res) {
    let list = findAll.findAll();
    res.render('viewAccount/viewHistory/auction-already-history',{
        product:list
    });
});

router.get('/auction-already-comment',  function (req, res) {
    let item = findAll.findByID(req.query.id);
    let list = []
    list.push(item);
    console.log(item);
    res.render('viewAccount/viewHistory/auction-already-comment',{
        product:list
    });
});

export default router;