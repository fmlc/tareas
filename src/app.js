const app = require('./config/server')
const router = require('./router/router')
const fs = require('fs-extra');

app.use(router.router);
app.use(router.configRouter);

