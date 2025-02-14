var express = require('express');   //Express framework, a popular Node.js web application framework used for building APIs and web applications.
var app = express();    //Create an instance of the Express framework.
var bodyParser = require('body-parser');    //Body-parser, a middleware that parses incoming request bodies in a middleware before handlers, available under the req.body property.
var mongoose = require('mongoose'); //Mongoose, an Object Data Modeling (ODM) library for MongoDB and Node.js, used to interact with MongoDB databases.
var db = mongoose.connect('mongodb://localhost/swag-shop');   //Connect to the MongoDB database named swag-shop.
var Product = require('./model/product');   //Import the Product model from the model/product.js file.
var WishList = require('./model/wishlist'); //Import the WishList model from the model/wishlist.js file.

app.use(bodyParser.json()); //Parse JSON data with JSON library.
app.use(bodyParser.urlencoded({ extended: false }));    //Parse URL-encoded data with querystring library.

app.post('/product', function(request, response) {
    //Create a new Product instance and set its title and price properties from the request body.
    var product = new Product();
    product.title = request.body.title;
    product.price = request.body.price;
    
    // ------Deprecated way of saving---------
    // product.save(function(err, savedProduct) {
    //     if (err) {
    //         response.status(500).send({ error: "Could not save product" });
    //     } else {
    //         response.status(200).send(savedProduct);
    //     }
    // }); 

    //Save the product instance to the database and send the saved product as a response.
    product.save()
        .then(function(savedProduct) {
            response.status(200).send(savedProduct);
        })
        .catch(function(err) {
            response.status(500).send({ error: "Could not save product" });
        });
});

app.get('/product', function(request, response) {
    // ------Deprecated way of fetching---------
    // Product.find({}, function(err, products) {
    //     if (err) {
    //         response.status(500).send({ error: "Could not fetch products" });
    //     } else {
    //         response.status(200).send(products);
    //     }
    // });
    //Fetch all products from the database and send them as a response.
    Product.find()
        .then(function(products) {
            response.status(200).send(products);
        })
        .catch(function(err) {
            response.status(500).send({ error: "Could not fetch products" });
        });
});

app.get('/wishlist', function(request, response) {
    // ------Deprecated way of fetching---------
    // WishList.find({}, function(err, wishLists) {
    //     if (err) {
    //         response.status(500).send({ error: "Could not fetch wish lists" });
    //     } else {
    //         response.status(200).send(wishLists);
    //     }
    // });
    //Fetch all wish lists from the database and send them as a response.
    WishList.find()
        // .then(function(wishLists) {
        //     response.status(200).send(wishLists);
        // })
        // .catch(function(err) {
        //     response.status(500).send({ error: "Could not fetch wish lists" });
        // });
        
        //instead of populating the just the productId field in the wish list, we can use the populate 
        //method to populate all product fields in the wish list using the Product model
        .populate({ path: 'products', model: 'Product' })
        .exec()
        .then(function(wishLists) {
            response.status(200).send(wishLists);
        })
        .catch(function(err) {
            response.status(500).send({ error: "Could not fetch wish lists" });
        });
        
    });
//Create a new wish list instance and set its title property from the request body.
app.post('/wishlist', function(request, response) {
    var wishList = new WishList();
    wishList.title = request.body.title;

    // ------Deprecated way of saving---------
    // wishList.save(function(err, newWishList) {
    //     if (err) {
    //         response.status(500).send({ error: "Could not create wish list" });
    //     } else {
    //         response.status(200).send(newWishList);
    //     }
    // });
    //Save the wish list instance to the database and send the saved wish list as a response.
    wishList.save()
        .then(function(newWishList) {
            response.status(200).send(newWishList);
        })
        .catch(function(err) {
            response.status(500).send({ error: "Could not create wish list" });
        });
});

// This is the deprecated way of adding a product to a wish list - It fails because the product is not found
// app.put('/wishlist/product/add', function(request, response) {
//     Product.findOne({_id: request.body.productId })
//         .then(function(product) {
//             WishList.update({ _id: request.body.wishListId }, { $addToSet: { products: product._id } })
//                 .then(function(wishList) {
//                     response.status(200).send(wishList);
//                 })
//                 .catch(function(err) {
//                     response.status(500).send({ error: "Could not add product to wish list" });
//                 });
//         })
//         .catch(function(err) {
//             response.status(500).send({ error: "Could not find product" });
//         });
// });

// Refactored code from ChatGPT
// Add a product to a wish list
app.put('/wishlist/product/add', async (request, response) => {
    try {
        const product = await Product.findById(request.body.productId);
        if (!product) {
            return response.status(404).send({ error: "Product not found" });
        }

        const updatedWishList = await WishList.findByIdAndUpdate(
            request.body.wishListId,
            { $addToSet: { products: product._id } },
            { new: true } // Returns the updated document
        );

        if (!updatedWishList) {
            return response.status(404).send({ error: "Wish list not found" });
        }

        response.status(200).send(updatedWishList);
    } catch (err) {
        console.error("Error:", err);
        response.status(500).send({ error: "Could not add product to wish list" });
    }
});
// Start the server on port 3000.
app.listen(3000, function() {
    console.log('Swag Shop is running on port 3000');
});
