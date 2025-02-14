var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/swag-shop');
var Product = require('./model/product');
var WishList = require('./model/wishlist');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/product', function(request, response) {

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

app.listen(3000, function() {
    console.log('Swag Shop is running on port 3000');
});
