// import .env file
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const route = require('./router/route')
const db = require('./config/db')
const path = require('path');

const artServer = express()

// use middlewares BEFORE routes
artServer.use(cors())
artServer.use(express.json()) // parses JSON body

// routes
artServer.use(route)

artServer.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// define port (process.env.PORT should come first)
const PORT = process.env.PORT || 5000

artServer.listen(PORT, () => {
  console.log("ArtServer is listening on port", PORT)
})
