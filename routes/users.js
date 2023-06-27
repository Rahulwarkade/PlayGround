var mongoose = require('mongoose');
var plm = require('passport-local-mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/try');

var userSchema = mongoose.Schema({
    username : String,
    password : String,
    image : {
        type : String,
        default : "avatar.webp"
    }
});

userSchema.plugin(plm);

module.exports = mongoose.model('user',userSchema);