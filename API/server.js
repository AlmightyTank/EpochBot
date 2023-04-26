import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { readdirSync } from 'fs'

const App = express()

App.use(express.json())

App.use(cors({
    origin: "http://localhost:3000", // allow to server to accept request from different origin
    methods: 'GET, POST',
    credentials: true // allow session cookie from browser to pass through
}))

// parse cookies
App.use(cookieParser())

// Routes
import Test from './Routes/test.js'
App.use('/test', Test)

import Main from './Routes/v1.js'
App.use('/v1', Main)


// Default Route
App.get('/', (req, res) => {
    res.send('<h7>Not Authorized.</h7>')
})

export default App