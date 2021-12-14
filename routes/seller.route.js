import express from 'express';
import modelProduct from '../models/product-model.js';
import modelCategory from '../models/category-model.js'
import multer  from 'multer'
import formatProduct from '../utils/format-product.js'
import fs from 'fs'
import path from 'path'
import {ObjectId} from "mongodb";

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


    for (const product of products)
        formatProduct.formatDate(product);

    res.render("./seller/channel_product", {
        layout: "seller.layout.hbs",
        products
    })
})

router.get("/channel/product/insert", async (req, res) => {
    res.locals.ThemSanPham.isActive = true;
    const catList = await modelCategory.getAll();
    console.log(catList);

    res.render("./seller/channel_product_insert", {
        layout: "seller.layout.hbs",
        catList
    })
})

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        console.log(`Destination : ${file.fieldname}`);
        if (file.fieldname === 'main-image') {
            req.body = formatProduct.formatForInsert(req.body);
            await modelProduct.insertData(req.body);
        }
        const idImage = req.body._id;

        const dir = `./public/${idImage}`
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, {recursive:true});
        }
        cb(null, `public/${idImage}/`)
    },
    filename: function (req, file, cb) {
        console.log(`Filename : ${file.fieldname}`);
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


router.post("/channel/product/insert", cpUpload , async (req, res) => {
    await modelProduct.updateDescription(req.body._id, req.body.proDescription);
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
    const list =  await modelProduct.findById(ProID);
    const product = list[0];
    await formatProduct.formatCategory(product);
    res.locals.XemSanPham.isActive = true;
    res.locals.XemChiTiet.isActive = true;
    res.render("./seller/channel_product_detail", {
        layout: "seller.layout.hbs",
        product
    })
})

router.post("/channel/product/detail/:id", async (req, res) => {
    let Message = req.body.proDescription;
    Message =  `<p class="text-danger h3"> ${new Date().toLocaleString("en-GB")}</p> ${Message}`;

    let ProID = req.params.id;
    const dataProduct = await modelProduct.findById(ProID);
    let insertedMessage = dataProduct[0].proDescription + Message;

    console.log("Message : " + req.body.proDescription);
    console.log("inserted message : " + insertedMessage);

    await modelProduct.updateDescription(new ObjectId(ProID), insertedMessage);

    res.redirect(`/seller/channel/product/detail/${ProID}`);
})

router.get("/channel/product/detail/:id/list", (req, res) => {
    res.locals.XemSanPham.isActive = true;
    res.render("./seller/channel_product_detail_listBider", {
        layout: "seller.layout.hbs"
    })
})

//API
router.get("/channel/getCatChild", async (req, res) => {
    const id = req.query.catParentID;
    const catChildList = await modelCategory.getCatChild(id);
    res.json(catChildList[0].catChild);
})

export default router;