import express from 'express';
import modelProduct from '../models/product-model.js';
import modelCategory from '../models/category-model.js'
import multer  from 'multer'
import formatProductData from '../utils/format-product.js'
import fs from 'fs'
import path from 'path'
import productModel from "../models/product-model.js";

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

router.get("/channel/product/insert", async (req, res) => {
    res.locals.ThemSanPham.isActive = true;
    const catName = await modelCategory.getCatParent();
    const catList= [];
    let count = 0;
    for (const catChild of catName){
        const objectCatChild = {};
        objectCatChild.name = catChild;
        objectCatChild.id = count;
        catList.push(objectCatChild);
        count++;
    }

    console.log(catList);
    res.render("./seller/channel_product_insert", {
        layout: "seller.layout.hbs",
        catList
    })
})

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        if (file.fieldname === 'main-image') {
            req.body = formatProductData(req.body);
            await modelProduct.insertData(req.body);
        }
        const idImage = req.body._id;

        const dir = `./public/${idImage}`
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, {recursive:true});
            console.log("Cap nhat thanh cong")
        }
        cb(null, `public/${idImage}/`)
    },
    filename: function (req, file, cb) {
        // console.log(path.extname(file.originalname));
        console.log(file);
        if (file.fieldname === 'main-image')
            cb(null, `main-thumb.jpg`);
        else if (file.fieldname === 'image1')
            cb(null, `thumb1.jpg`);
        else
            cb(null, `thumb2.jpg`);
    }
})

const upload = multer({ storage: storage })
const cpUpload = upload.fields([{ name: 'main-image', maxCount: 1 }, { name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }])


router.post("/channel/product/insert", cpUpload , (req, res) => {
    res.redirect(`/seller/channel/product/detail/${req.body._id}`);
})

router.get("/channel/product/insert/review", (req, res) => {
    res.locals.ThemSanPham.isActive = true;
    res.render("./seller/channel_product_insert_review", {
        layout: "seller.layout.hbs"
    })
})

router.get("/channel/product/detail/:id", async function(req, res) {
    const ProID = req.params.id;
    const list =  await modelProduct.findById(id);
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

//API
router.get("/channel/getCatChild", async (req, res) => {
    const catListName = await modelCategory.getCatParent();
    const id = +req.query.catParentID;
    const catParentName = catListName[id];
    const catChildList = await modelCategory.getCatChild(catParentName);
    res.json(catChildList);
})

export default router;