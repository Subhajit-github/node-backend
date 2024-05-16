const express = require('express');
require('dotenv').config;
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.get('/twitter', (req,res) => {
    res.send('Hello Twitter!');
})

app.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT}`);
})
