const mongoose = require('mongoose');
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/pinterest");

const userSchema = new mongoose.Schema({
    email: String,
    username: String,
    fullname: String,
    profileImage: String,
    password: String,
    posts: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    }
]

});
userSchema.plugin(plm);

module.exports = mongoose.model('user', userSchema);
