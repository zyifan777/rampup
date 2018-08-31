var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var User = require('./models/user');
var Message = require('./models/message');
var session = require('express-session');

var login = false;

// connect to database 
mongoose.connect("mongodb://localhost:27017/rampup",  { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    name: 'aaa' 
}));


// var username; 
app.set('view engine', 'ejs');


app.get('/', function(req, res) {
	login = false;
	// res.send('This will be the landing page soon');
	res.render('home');
});

io.on('connection', function(socket){

  socket.on('chat message', function(data){
  	console.log('hey');
  	Message.create({username: data.username, time: data.time,content: data.text}, function (err, newMessage) {
  		if (err) {
  			console.log(err);
  		} else {
  			console.log('got a new message');
  			console.log(newMessage);
  		}
  	});
    io.emit('chat message', data);
  });

});

app.get('/login', function(req,res){
	login = false;
	res.render('login');
});

app.get('/signup', function(req, res){
	login = false;
	res.render('signup.ejs');
});

app.post('/login', function(req, res){
	User.findOne({username: req.body.username, password: req.body.password}, function(err, user) {
		if (!user) {
			login = false;
			res.render('loginBack');
		} else {

			console.log('log in!!!');
			login = true;


			res.redirect('/chat/' + req.body.username);

		}
	});
});

app.post('/signup', function(req, res){
	login = false;
	User.findOne({username:req.body.username}, function(err, user) {
		if (user) {
			res.render('signupBack');
		} else {
			var name = req.body.username;
			var password = req.body.password;
			var newUser = {username:name, password:password};

			User.create(newUser, function(err, newlyCreated) {
				if (err) {
					console.log(err);
				} else {
					res.render('signupSuccess');
				}
			})
		}
	})
})

app.get('/chat/:id', function (req,res) {
	if (login) {
		Message.find({}, function(err, allMessages) {
			if (err) {
				console.log(err);
			} else {
				// console.log(allMessages);
				console.log("current id");
				console.log(req.params.id);

				currentUser = req.params.id;
				res.render('chat',{username:req.params.id, messages : allMessages});
			}
		})
	} else {
		res.render('tologin');
	}
});


http.listen(3000, function () {
	console.log('FSE CHAT ROOM SERVER HAS STARTED');
});

