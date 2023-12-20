const Page = require("../../models/page");

exports.createPage = async (req, res) => {
  const { banners, products } = req.files;
  // Process banners
  if (banners && banners.length > 0) {
    req.body.banners = banners.map((banner, index) => ({
      img: `/public/${banner.filename}`,
      navigateTo: `/bannerClicked?categoryId=${req.body.category}&type=${req.body.type}`,
    }));
  }
  // Process products
  if (products && products.length > 0) {
    req.body.products = products.map((product, index) => ({
      img: `/public/${product.filename}`,
      navigateTo: `/productClicked?categoryId=${req.body.category}&type=${req.body.type}`,
    }));
  }

  req.body.createdBy = req.user._id;

  try {
    let page = await Page.findOne({ category: req.body.category });
    
    if (page) {
      page = await Page.findOneAndUpdate({ category: req.body.category }, req.body, { new: true }).exec();
      return res.status(201).json({ page });
    } else {
      const newPage = new Page(req.body);
      page = await newPage.save();
      return res.status(201).json({ page });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message || "An error occurred" });
  }
};


exports.getPage = async (req, res) => {
  const { category, type } = req.params;
  if (type === "page") {
    try {
      const page = await Page.findOne({ category });
      if (page) {
        return res.status(200).json({ page });
      } else {
        return res.status(404).json({ error: "Page not found" });
      }
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

