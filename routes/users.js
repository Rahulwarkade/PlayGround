// var mongoose = require('mongoose');
var plm = require('passport-local-mongoose');

// mongoose.connect("mongodb://localhost:27017/try");

// var userSchema = mongoose.Schema({
//     username : String,
//     password : String,
//     image : {
//         type : String,
//         default : "avatar.webp"
//     },
//     posts : [{
//         type : mongoose.Schema.Types.ObjectId,
//         ref : "post"
//     }],
//     likes : {
//         type : Array,
//         default : []
//     }
// });


// module.exports = mongoose.model('user',userSchema);
var mongoose = require("mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/dbname")

var userSchema = mongoose.Schema(
  {
    username : String,
    password : String,
    image : {
        type : String,
        default : "avatar.webp"
    },
    posts : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "post"
    }],
    likes : {
        type : Array,
        default : []
    }
  }
)
userSchema.plugin(plm);

module.exports = mongoose.model("user",userSchema);