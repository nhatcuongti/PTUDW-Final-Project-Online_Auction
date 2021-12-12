export default function (app) {
    app.use(async function (req, res, next) {
        // res.locals.lcCategories[1].isActive = 1;
        res.locals.ThongTinChung = {isActive:false};
        res.locals.XemSanPham = {isActive:false};
        res.locals.ThemSanPham = {isActive:false};
        res.locals.XemChiTiet = {isActive:false};
        next();
    });
}