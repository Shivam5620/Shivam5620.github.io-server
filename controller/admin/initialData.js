const Category = require("../../models/category");
const Product = require("../../models/product");
const Order = require("../../models/order");

function createCategories(categories, parentId = null) {
  const categoryList = [];
  let category;
  if (parentId == null) {
    category = categories.filter((cat) => cat.parentId == undefined);
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);
  }

  for (let cate of category) {
    categoryList.push({
      _id: cate._id,
      name: cate.name,
      slug: cate.slug,
      parentId: cate.parentId,
      type: cate.type,
      children: createCategories(categories, cate._id),
    });
  }

  return categoryList;
}

exports.initialData = async (req, res) => {
  try {
    const categories = await Category.find({}).select("_id name");
    
    const products = await Product.find({ })
      .select("_id name price quantity slug description productPictures category")
      .populate({ path: "category", select: "_id name" });

    const orders = await Order.find({})
      .populate("items.productId", "name");

    res.status(200).json({
      categories,
      products,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

