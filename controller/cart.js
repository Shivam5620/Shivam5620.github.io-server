const Cart = require("../models/cart");

function runUpdate(condition, updateData) {
  return new Promise((resolve, reject) => {
    //you update code here

    Cart.findOneAndUpdate(condition, updateData, { upsert: true })
      .then((result) => resolve())
      .catch((err) => reject(err));
  });
}

exports.addItemToCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      let promiseArray = [];

      req.body.cartItems.forEach((cartItem) => {
        const product = cartItem.product;
        const item = cart.cartItems.find((c) => c.product == product);
        let condition, update;

        if (item) {
          condition = { user: req.user._id, "cartItems.product": product };
          update = {
            $set: {
              "cartItems.$": cartItem,
            },
          };
        } else {
          condition = { user: req.user._id };
          update = {
            $push: {
              cartItems: cartItem,
            },
          };
        }

        promiseArray.push(runUpdate(condition, update));
      });

      await Promise.all(promiseArray);
      return res.status(201).json({ message: "Cart updated successfully" });
    } else {
      const newCart = new Cart({
        user: req.user._id,
        cartItems: req.body.cartItems,
      });

      const savedCart = await newCart.save();
      return res.status(201).json({ cart: savedCart, message: "New cart created" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message || "Something went wrong" });
  }
};


exports.getCartItems = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("cartItems.product", "_id name price productPictures");

    if (cart) {
      let cartItems = {};
      cart.cartItems.forEach((item, index) => {
        cartItems[item.product._id.toString()] = {
          _id: item.product._id.toString(),
          name: item.product.name,
          img: item.product.productPictures[0].img,
          price: item.product.price,
          qty: item.quantity,
        };
      });
      return res.status(200).json({ cartItems });
    } else {
      return res.status(404).json({ message: "Cart not found" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message || "Something went wrong" });
  }
};


// new update remove cart items
exports.removeCartItems = (req, res) => {
  const { productId } = req.body.payload;
  if (productId) {
    Cart.update(
      { user: req.user._id },
      {
        $pull: {
          cartItems: {
            product: productId,
          },
        },
      }
    ).exec((error, result) => {
      if (error) return res.status(400).json({ error });
      if (result) {
        res.status(202).json({ result });
      }
    });
  }
};
