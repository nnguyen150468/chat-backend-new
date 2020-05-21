require('dotenv').config({path: '.env'})
const mongoose = require('mongoose')
const app = require('./app')

const http = require('http')
const server = http.createServer(app)

const socketio = require('socket.io');

const io = socketio(server);

const Server = require('./src/utils/server')

const Room = require('./src/models/room')

const Filter = require('bad-words')

io.on("connection", async (socket)=>{
    socket.on("chat", async (chatObj) => {
        try{
            const server = await Server.checkUser(socket.id)

            await server.checkMember(server.user.room._id)
            
            const filter = new Filter()

            if(filter.isProfane(chatObj.text)){
                throw new Error("Bad words are not allowed")
            }

            const chat = await server.createChat(chatObj)

            console.log('chat===',chat)
            io.to(server.user.room._id).emit("message", chat)
            
        } catch(err){
            console.log(err)
        }

    })

    io.emit("rooms", await Room.find())

    socket.on("login", async (userName, cb) => {
        try{
            const user = await Server.login(userName, socket.id)
            
            // return cb({ok: true, data: user})
            return cb(user)
        } catch(err){
            console.log(err)
        }
    })

    socket.on("joinRoom", async (rID, cb)=>{
        try{
            const server = await Server.checkUser(socket.id)

            await server.joinRoom(rID)

            socket.emit("selectedRoom", server.user.room)
            // console.log('selectedRoom', server.user.room)

            socket.join(server.user.room._id)

            const welcomeMessage = await server.createWelcomeMessage()
            socket.emit("message", welcomeMessage)
            
            const newUserJoin = await server.newUserJoinMessage()
            socket.broadcast.to(server.user.room._id).emit("message", newUserJoin)

            io.emit("rooms", await Room.find())

            // cb()
        } catch(err){
            // return cb({ok: false, error: err.message})
            console.log(err)
        }
    })

    socket.on("leaveRoom", async(_, cb) => {
        try{
            const server = await Server.checkUser(socket.id)

            await server.leaveRoom()

            const youHaveLeft = await server.youHaveLeft()
            socket.emit("message", youHaveLeft)

            const userHasLeft = await server.userHasLeft()
            socket.broadcast.to(server.user.room._id).emit("message", userHasLeft)

            socket.leave(server.user.room._id) 
            
            io.emit("rooms", await Room.find())

        } catch(err){
            cb({ok: false, error: err.message})
        }

    })

    socket.on("disconnect", async () => {
        try{
            const server = await Server.checkUser(socket.id)

            await server.leaveRoom()

            const userHasLeft = await server.userHasLeft()
            
            socket.leave(server.user.room._id)
            
            socket.broadcast.to(server.user.room._id).emit("message", userHasLeft)
            io.emit("rooms", await Room.find())

        } catch(err){
            console.log(err.message)
        }
    })

    console.log("Established new connection")
})



mongoose.connect(process.env.DB, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(()=> console.log("Successfully connected to database"))

server.listen(process.env.PORT, ()=>{
    console.log("Server listening to port",process.env.PORT)
})    