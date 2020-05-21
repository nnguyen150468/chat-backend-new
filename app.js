const express = require('express')
const app = express()
const router = express.Router()

app.use(router)

const Room = require('./src/models/room')

router.route("/")
.get((req, res) => res.send('ok'))

router.route("/create-rooms")
.get( async (req, res) => {
    try{
        await Room.insertMany([
            {
                name: "Chrome",
                members: []
              },
              {
                name: "Safari",
                members: []
              },
              {
                name: "FireFox",
                members: []
              },
              {
                name: "Opera",
                members: []
              },
              {
                name: "Coccoc",
                members: []
              }
        ]);
    res.send('rooms created')

    } catch(err){
        return res.send(err.message)
    }
})

module.exports = app;