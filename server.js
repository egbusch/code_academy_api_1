const express = require('express');
const app = express();

const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const apiRouter = require('./api/api');  // importa el modulo de rutas de /api

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));
app.use('/api', apiRouter);  // linkea el uso de las rutas de /api

app.use(errorhandler());

const PORT = 4000;

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});

module.exports = app;