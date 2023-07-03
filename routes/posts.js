var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
    postData : String,
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    time : {
        type : Date,
        default : Date.now,
    }
});

module.exports = mongoose.model('post',postSchema);