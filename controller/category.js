// Import necessary modules
const Category = require("../models/category");
const slugify = require("slugify");
const shortid = require("shortid");

// Recursive function to create a nested category list
function createCategories(categories, parentId = null) {
  const categoryList = [];
  let category;
  // Filter categories based on parentId
  if (parentId == null) {
    category = categories.filter((cat) => cat.parentId == undefined);
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);
  }

  // Iterate through filtered categories to create nested structure
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

// Controller function to add a category
exports.addCategory = async (req, res) => {
  try {
    const categoryObj = {
      name: req.body.name,
      slug: `${slugify(req.body.name)}-${shortid.generate()}`,
      createdBy: req.user._id,
    };

    if (req.file) {
      categoryObj.categoryImage = "/public/" + req.file.filename;
    }

    if (req.body.parentId) {
      categoryObj.parentId = req.body.parentId;
    }

    const cat = new Category(categoryObj);
    const savedCategory = await cat.save();

    if (savedCategory) {
      return res.status(201).json({ category: savedCategory });
    }
  } catch (error) {
    return res.status(400).json({ error: "Something went wrong" });
  }
};

// Controller function to get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    if (categories.length > 0) {
      const categoryList = createCategories(categories);
      res.status(200).json({ categoryList });
    } else {
      res.status(404).json({ message: 'No categories found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Controller function to update categories
exports.updateCategories = async (req, res, next) => {
  try {
    const { _id, name, parentId, type } = req.body;
    const updateOperation = Array.isArray(name) ? 'multiple' : 'single';

    const updateCategory = async (id, index) => {
      const category = {
        name: name[index],
        type: type[index],
      };

      if (parentId[index] !== "") {
        category.parentId = parentId[index];
      }

      return await Category.findOneAndUpdate({ _id: id }, category, { new: true });
    };

    let updatedItems;
    if (updateOperation === 'multiple') {
      const updatePromises = _id.map(async (id, index) => await updateCategory(id, index));
      updatedItems = await Promise.all(updatePromises);
    } else {
      updatedItems = await updateCategory(_id, 0);
    }

    res.status(201).json({ updatedCategories: updatedItems });
  } catch (err) {
    next(err);
  }
};


// Controller function to delete categories
exports.deleteCategories = async (req, res) => {
  const { ids } = req.body.payload;
  const deletedCategories = [];

  // Loop through each category ID and delete
  for (let i = 0; i < ids.length; i++) {
    const deleteCategory = await Category.findOneAndDelete({
      _id: ids[i]._id,
      createdBy: req.user._id,
    });
    deletedCategories.push(deleteCategory);
  }

  // Check if all categories were deleted successfully
  if (deletedCategories.length == ids.length) {
    res.status(201).json({ message: "Categories removed" });
  } else {
    res.status(400).json({ message: "Something went wrong" });
  }
};
