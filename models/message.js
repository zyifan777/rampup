var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
	username: String,
	time: String,
	content: String
});

module.exports = mongoose.model("Message", messageSchema);