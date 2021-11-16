const express = require('express');
const exphbs = require('express-handlebars')
const session = require('express-session');
var methodOverride = require('method-override')
const path = require('path');
const fs = require('fs-extra');
const flash = require('express-flash');
const morgan = require('morgan');
const fileUpload = require('express-fileupload')

require('dotenv').config()

const app = express();

let view = path.join(path.dirname(__dirname), 'views')
app.use(methodOverride('_method'))
app.use(session({
    secret: 'my_app',
    saveUninitialized: false,
    resave: false
}))
app.use(flash())
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : './src/temp',
    safeFileNames: true,
    preserveExtension: true
}))


app.set('port', process.env.PORT)
app.set('views', view)
app.engine('hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(view, 'layouts'),
    partialsDir: path.join(view, 'partials'),
    extname: 'hbs'
}))
app.set('view engine', 'hbs');
app.use(express.static('./src/public'));

app.use(morgan('dev'))
app.listen(app.get('port'),() => {
    console.log('listening on port',app.get('port'));
});



module.exports = app;
