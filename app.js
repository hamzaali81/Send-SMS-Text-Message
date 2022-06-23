const express = require('express');
const Vonage = require('@vonage/server-sdk')
const ejs = require('ejs');
const socketio = require('socket.io');
var bodyParser = require('body-parser');

const vonage = new Vonage({
    apiKey: "",
    apiSecret: ""
  }, {debug: true})

const app = express();
app.use(express.json());


app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

app.use(express.static(__dirname + '/public'));


// route
app.get('/', (req, res)=> {
   res.render('index')
});

// Catch from submit
app.post('/', (req, res)=> {
    res.send(req.body);
    // const { number, text } = req.body;
    const from = "Vonage APIs"
const to = "923133932783"
const text = 'A text message sent using the Vonage SMS API'

vonage.message.sendSms(from, to, text, (err, responseData) => {
    if (err) {
        console.log(err);
    } else {
        if(responseData.messages[0]['status'] === "0") {
            console.log("Message sent successfully.");
            const { ['message-id']: id, ['to']: number, ['error-text']: error  } = responseData.messages[0];
            console.dir(responseData);
            // Get data from response
            const data = {
              id,
              number,
              error
            };
    
            // Emit to the client
            io.emit('smsStatus', data);
        } else {
            console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
        }
    }
})
});

const port = 3000;

const server = app.listen(port, ()=> {
    console.log(`Server is started at ${port}`);
});


// Connect to socket.io
const io = socketio(server);
io.on('connection', (socket) => {
  console.log('Connected');
  io.on('disconnect', () => {
    console.log('Disconnected');
  })
});