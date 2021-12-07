import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.get('/detail', function (req, res) {
    res.sendFile(__dirname + '/views/detail.html');
});
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/home.html');
});
app.get('/search', function (req, res) {
    res.sendFile(__dirname + '/views/search.html');
});
app.get('/signup', function (req, res) {
    res.sendFile(__dirname + '/views/signup.html');
});


const port = 3000;
app.listen(port, function () {
    console.log(`Example app listening at http://localhost:${port}`);
});