var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var objectId = mongoose.Schema.Types.ObjectId;

var wishlist = new Schema({
    title: { type: String, default: "Cool Wish List" },
    products: [{ type: objectId, ref: 'Product' }]
});

module.exports = mongoose.model('Wishlist', wishlist);
