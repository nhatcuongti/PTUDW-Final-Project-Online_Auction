import express from 'express';
import modelProduct from '../models/product-model.js';
import modelCategory from '../models/category-model.js'
import multer  from 'multer'
import formatProduct from '../utils/format-product.js'
import fs from 'fs'
import path from 'path'
import page from "../utils/page.js";
import {ObjectId} from "mongodb";
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
    let products = null;
    const categories = await modelCategory.getAll();

    //Handle Category
    const catParentFind = req.query.catParent;
    const catChildFind = req.query.catChild;


    if (catParentFind != undefined && catChildFind != undefined)
        products = await modelProduct.findByCategory(catParentFind, catChildFind);
    else if (catParentFind != undefined)
        products = await modelProduct.findByCategoryParent(new ObjectId(catParentFind));
    else
        products = await modelProduct.getAll();

    //Taking products with id seller
    const userID = res.locals.user._id;
    formatProduct.findProductWithSellerID(products, userID);

    //Find with status product
    let status = req.query.status;
    if (status != undefined )
        await formatProduct.findProductWithStatus(products, status);

    if (status === "1")
        status = "Đấu giá thành công"
    else if (status === "2")
        status = "Đấu giá thất bại"
    else if (status === "3")
        status = "Đang được đấu giá"
    else if (status === "4")
        status = "Chưa được đấu giá"
    else
        status = "Tất cả"

    //Handle page
    let nPage = Math.floor((products.length - 1) / 6) + 1;
    const choosenPage = req.query.page;
    let prevPage = {check:true, value : 0};
    let nextPage = {check:true, value : 0};
    let curPage = {check:true, value : 0};
    await page.handlePage(prevPage, curPage, nextPage, choosenPage, nPage );


    //Find offset base on curPage
    let limitProduct = 6;
    let offset = ((+choosenPage - 1) * limitProduct) || 0;
    const numberProduct = products.length;
    products = products.slice(offset, (offset + limitProduct  < numberProduct) ? offset + limitProduct : numberProduct)





    res.render("./seller/channel_product", {
        layout: "seller.layout.hbs",
        products,
        categories,
        status,
        prevPage,
        nextPage,
        curPage
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

// const uploadData = async (req, res, next) => {
//     req.body = formatProduct.formatForInsert(req.body);
//     await modelProduct.insertData(req.body);
//     console.log(req.body._id);
//     next();
// }

//Upload Image
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const dir = `./public/image`
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, {recursive: true});
            console.log("Create Folder");
        }
        cb(null, `public/image`)
    },
    filename: async function (req, file, cb) {
        const ext = path.extname(file.originalname);
        console.log(ext);
        if (file.fieldname === 'main-image'){
            cb(null, `main-thumb${ext}`);
            console.log("Create main-thumb.jpg");
        }
        else if (file.fieldname === 'image1'){
            cb(null, `thumb1${ext}`);
            console.log("Create thumb1.jpg")
        }
        else{
            cb(null, `thumb2${ext}`);
            console.log("Create thumb2.jpg")
        }
    }
})

const upload = multer({ storage: storage })
const cpUpload = upload.fields([{ name: 'main-image', maxCount: 1 }, { name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }])

const afterUploadImage = async (req, res, next) => {
    req.body = await formatProduct.formatForInsert(req.body, res.locals.user._id);
    await modelProduct.insertData(req.body);
    console.log(req.body);
    next();
}

router.post("/channel/product/insert", cpUpload,  afterUploadImage, async (req, res) => {
    //Change folder name
    const oldFolderName = "./public/image";
    const newFolderName = `./public/${req.body._id}`;
    fs.rename(oldFolderName, newFolderName, async (err) => {
        if (err){
            console.log("Some thing Wrong !!");
        }

        await modelProduct.updateDescription(req.body._id, req.body.proDescription);
        res.redirect(`/seller/channel/product/detail/${req.body._id}`);
    });

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

    const status = await formatProduct.getStatus(product);
    const isSuccess = (status === "Đấu giá thành công") ? true : false;

    res.locals.XemSanPham.isActive = true;
    res.locals.XemChiTiet.isActive = true;
    res.render("./seller/channel_product_detail", {
        layout: "seller.layout.hbs",
        product,
        status,
        isSuccess
    })
})

router.post("/channel/product/detail/:id", async (req, res) => {
    const userID = req.body.userID;
    let ProID = req.params.id;
    if (userID != undefined){
        console.log(userID);
    }
    else{
        let Message = req.body.proDescription;
        Message =  `<p class="text-danger h3"> ${new Date().toLocaleString("en-GB")}</p> ${Message}`;


        const dataProduct = await modelProduct.findById(ProID);
        let insertedMessage = dataProduct[0].proDescription + Message;

        console.log("Message : " + req.body.proDescription);
        console.log("inserted message : " + insertedMessage);

        await modelProduct.updateDescription(new ObjectId(ProID), insertedMessage);
    }


    res.redirect(`/seller/channel/product/detail/${ProID}`);
})

router.get("/channel/product/detail/:id/list", async (req, res) => {
    res.locals.XemSanPham.isActive = true;

    //Getting user data from bidderHistory
    const productID = req.params.id;
    const bidderHistory = await productModel.getBidderHistoryWithProID(productID);

    //Handle page
    let nPage = Math.floor((bidderHistory.length - 1) / 8) + 1;
    const choosenPage = req.query.page;
    let prevPage = {check:true, value : 0};
    let nextPage = {check:true, value : 0};
    let curPage = {check:true, value : 0};
    await page.handlePage(prevPage, curPage, nextPage, choosenPage, nPage );


    //Find offset base on curPage
    let limitUser = 8;
    let offset = ((+choosenPage - 1) * limitUser) || 0;
    const numberUser = bidderHistory.length;
    bidderHistory.slice(offset, (offset + limitUser  < numberUser) ? offset + limitUser : numberUser)

    res.render("./seller/channel_product_detail_listBider", {
        layout: "seller.layout.hbs",
        bidderHistory,
        productID,
        prevPage,
        nextPage,
        curPage
    })
})

router.post("/channel/product/detail/:id/list", async (req, res) => {
    res.locals.XemSanPham.isActive = true;

    //Getting user data from bidderHistory
    const productID = req.params.id;
    const userID = req.body.userID;

    console.log(productID);
    console.log(userID);
    await productModel.denyUserOnBidderHistory(productID, userID);

    res.redirect(`/seller/channel/product/detail/${productID}/list`)
})

//API
router.get("/channel/getCatChild", async (req, res) => {
    const id = req.query.catParentID;
    const catChildList = await modelCategory.getCatChild(id);
    res.json(catChildList[0].catChild);
})

export default router;