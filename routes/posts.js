var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
    postData : String,
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
});

module.exports = mongoose.model('post',postSchema);