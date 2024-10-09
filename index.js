const express = require('express')
const app = express()
const port = 5000
const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://vtwin123456:1rlaglacks@boilerplate.xkisk.mongodb.net/?retryWrites=true&w=majority&appName=boilerplate')
    .then(() => console.log('MongoDB Connected..'))
    .catch(err => console.log(err))

app.get('/', (req, res) => res.send("Hello World"))

app.listen(port, () => console.log(`Example app listening on port ${port}`))
