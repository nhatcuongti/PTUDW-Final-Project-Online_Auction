import express from 'express';
import productModel from '../models/product-model.js';

const router = express.Router();

router.get('/detail', async function (req, res) {

    //await productModel.add();
    const product = await productModel.find();
    console.log(product);
    res.render('detail', {
        product
    });
});
router.get('/', function (req, res) {
    res.render('home');
});
router.get('/search', function (req, res) {
    res.render('search');
});
router.get('/signup', function (req, res) {
    res.render('signup');
});

export default router;