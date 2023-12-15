const Product = require("../models/product");
const slugify = require("slugify");
const Category = require("../models/category");

exports.createProduct = async (req, res) => {
  const { name, price, description, category, quantity } = req.body;
  let productPictures = [];

  if (req.files.length > 0) {
    productPictures = req.files.map((file) => {
      return { img: file.filename };
    });
  }

  try {
    const product = new Product({
      name: name,
      slug: slugify(name),
      price,
      quantity,
      description,
      productPictures,
      category,
    });

    const savedProduct = await product.save();
    res.status(201).json({ product: savedProduct, files: req.files });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.getProductsBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const category = await Category.findOne({ slug }).select("_id type").exec();

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const products = await Product.find({ category: category._id }).exec();

    if (category.type && products.length > 0) {
      const priceRanges = {
        under5k: products.filter((product) => product.price <= 5000),
        under10k: products.filter((product) => product.price > 5000 && product.price <= 10000),
        under15k: products.filter((product) => product.price > 10000 && product.price <= 15000),
        under20k: products.filter((product) => product.price > 15000 && product.price <= 20000),
        under30k: products.filter((product) => product.price > 20000 && product.price <= 30000),
      };

      return res.status(200).json({
        products,
        priceRange: {
          under5k: 5000,
          under10k: 10000,
          under15k: 15000,
          under20k: 20000,
          under30k: 30000,
        },
        productsByPrice: priceRanges,
      });
    } else {
      return res.status(200).json({ products });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


exports.getProductDetailsById = async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ error: "productId parameter is required" });
  }

  try {
    const product = await Product.findOne({ _id: productId }).exec();

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ error: "Error fetching product", detail: error.message });
  }
};



// new update
exports.deleteProductById = async (req, res) => {
  const { productId } = req.body.payload;

  if (!productId) {
    return res.status(400).json({ error: "ProductId is required in the payload" });
  }

  try {
    const result = await Product.deleteOne({ _id: productId });

    if (result.deletedCount === 1) {
      return res.status(200).json({ message: "Product deleted successfully" });
    } else {
      return res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Error deleting the product", detail: error.message });
  }
};



exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .select("_id name price quantity slug description productPictures category")
      .populate({ path: "category", select: "_id name" });

    res.status(200).json({ products });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


