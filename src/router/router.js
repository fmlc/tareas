const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');
const app = require('../config/server');


router.get('/', function (req, res) {
    res.render('index');
})

router.get('/index', function (req, res) {
    res.send('index');
})

router.get('/about', function (req, res) {
    res.send('about');
})

configRouter = (req, res) => {
    let archivos = fs.readdirSync(__dirname)
    for (let i = 0; i < archivos.length; i++) {
        let file = archivos[i].split('.')[0]
        if (file != 'router') {
            router.use(`/${file}`, require(`./${file}`));
        }
    }
}

//router.use(configRouter);

module.exports = { router, configRouter };