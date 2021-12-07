import express from 'express';
import morgan from 'morgan';
import { engine } from 'express-handlebars'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import numeral from 'numeral';
import mainRoute from './routes/main-route.js'

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
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', './views');
app.use('/public', express.static('public'));


app.use('/', mainRoute);


const port = 3000;
app.listen(port, function () {
    console.log(`Example app listening at http://localhost:${port}`);
});