import productModel from "../models/product-model.js";
import {ObjectID} from "mongodb";

export default function auth(req, res, next) {
    if (req.session.auth === false) {
        req.session.retUrl = req.originalUrl;
        return res.redirect('/login');
    }
    next();
};

export function authAdmin(req, res, next) {
    if (req.session.auth === false) {
        req.session.retUrl = req.originalUrl;
        return res.redirect('/login');
    }
    if (res.locals.adminRole === false)
        return res.redirect('/');
    next();
};

export function authSeller(req, res, next) {
    if (req.session.auth === false) {
        req.session.retUrl = req.originalUrl;
        return res.redirect('/login');
    }
    if (res.locals.sellerRole === false)
        return res.redirect('/');

    next();
};

export async function authUserWithProduct(req, res, next) {
    const user = req.session.user[0]._id;
    const proId = req.params.id;
    const product = await productModel.findById(proId);
    console.log(user);
    if (product.length === 0 || product[0].sellerInfo.length === 0)
        return res.redirect("/");

    if (product[0].sellerInfo[0]._id.toString() ===  user.toString())
        return next();

    return res.redirect('/login');
};