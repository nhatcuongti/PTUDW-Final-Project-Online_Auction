import morgan from 'morgan';
import { engine } from 'express-handlebars'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import express_section from 'express-handlebars-sections'
import localMDW from "./middlewares/local.mdw.js";
import express from 'express';
import numeral from 'numeral';
import main from './routes/main-route.js'
import account  from "./routes/account.js";
import seller from "./routes/seller.route.js"
import session from 'express-session';
import asyncErrors from 'express-async-errors';




const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(morgan('dev'));
app.use(express.urlencoded({
    extended: true
}));
app.engine('hbs', engine({
    defaultLayout: 'main.hbs',
    helpers: {
        format_number(val) {
            return numeral(val).format('0, 0');
        },
        format_date(val){
            return val.toLocaleString("en-GB");
        },
        section: express_section()
    }
}));
app.set('view engine', 'hbs');
app.set('views', './views');
app.use('/public', express.static('public'));
app.set('trust proxy', 1);
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { }
}));




localMDW(app);
app.use('/', main);
app.use('/user', account);
app.use('/seller', seller);

const port = 3000;
app.listen(port, function () {
    console.log(`Example app listening at http://localhost:${port}`);
});