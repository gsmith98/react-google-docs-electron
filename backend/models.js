const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    documents: [{
        type: Schema.ObjectId,
        ref: 'Doc'
    }]
})

const docSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
})
module.exports = {
    User: mongoose.model('User', userSchema),
    Doc: mongoose.model('Doc', docSchema)
}
