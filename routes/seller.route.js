import express from 'express';
import modelProduct from '../models/product-model.js'

const router = express.Router();

router.get("/channel", (req, res) => {
    res.locals.ThongTinChung.isActive = true;
    res.render("./seller/channel", {
        layout: "seller.layout.hbs"
    })
})

router.get("/channel/product", async (req, res) => {
    res.locals.XemSanPham.isActive = true;
    const products = await modelProduct.getAll();

    res.render("./seller/channel_product", {
        layout: "seller.layout.hbs",
        products
    })
})

router.get("/channel/product/insert", (req, res) => {
    res.locals.ThemSanPham.isActive = true;
    res.render("./seller/channel_product_insert", {
        layout: "seller.layout.hbs"
    })
})

router.post("/channel/product/insert", (req, res) => {
    console.log(req.body);
    res.redirect("/seller/channel/product");
})



router.get("/channel/product/insert/review", (req, res) => {
    res.locals.ThemSanPham.isActive = true;
    res.render("./seller/channel_product_insert_review", {
        layout: "seller.layout.hbs"
    })
})

router.get("/channel/product/detail/:id", async (req, res) => {
    const ProID = req.params.id;
    const list =  await modelProduct.findByID(ProID);
    const product = list[0];
    console.log(product);
    res.locals.XemSanPham.isActive = true;
    res.locals.XemChiTiet.isActive = true;
    res.render("./seller/channel_product_detail", {
        layout: "seller.layout.hbs",
        product
    })
})

router.get("/channel/product/detail/:id/list", (req, res) => {
    res.locals.XemSanPham.isActive = true;
    console.log("hello");
    res.render("./seller/channel_product_detail_listBider", {
        layout: "seller.layout.hbs"
    })
})

export default router;