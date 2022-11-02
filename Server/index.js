const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const checkAuth = require('./middleware/check-auth');

const {instrument} = require("@socket.io/admin-ui")
const JoinRoom = require("./SocketEvents/JoinRoom")
const CreateRoom = require("./SocketEvents/CreateRoom")
const SendMessage = require("./SocketEvents/SendMessage")
const RefreshCheck = require("./SocketEvents/RefreshCheck")
const io = require("socket.io")(8080,{
    cors :{
        origin: ["http://localhost:3000", "https://admin.socket.io"],
        methods: ['GET', 'POST'],
    }
})


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(cors());
dotenv.config();

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => { 
    console.log("DB connected")
})

app.use('/signUp', require('./routes/SignUp.route'));
app.use('/login', require('./routes/Login.route'));
app.use('/uploadvideo', checkAuth, require('./routes/UploadVideo.route'));
app.use('/uploadaudio', checkAuth, require('./routes/UploadAudio.route'));
app.use('/videolist', require('./routes/VideoList.route'));
app.use('/audiolist', require('./routes/AudioList.route'));
app.use('/getuservideos', require('./routes/GetUserVideos.route'));
app.use('/getuseraudios', require('./routes/GetUserAudios.route'));
app.use('/',require('./routes/Video.route'));
app.use('/',require('./routes/Audio.route'));
app.use('/getuserdata',require('./routes/GetUserData.route'));
app.use('/updateplaylists',require('./routes/Playlists.route'));
app.use('/getvideos',require('./routes/GetVideos.route'));
app.use('/getaudios',require('./routes/GetAudios.route'));

io.on("connection", socket => {
    JoinRoom(socket,io)
    CreateRoom(socket)
    SendMessage(socket, io)
    RefreshCheck(socket)
})
instrument(io, {auth : false})
app.listen(9002, () => {
    console.log("BE started at port 9002")
})