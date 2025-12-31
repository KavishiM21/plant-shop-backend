import Product from "../models/Product.js";
import { isAdmin } from "./userController.js";

export function createProduct(req, res) {
  if (!isAdmin(req)) {
    res.status(403).json({
      message: "Forbidden",
    });
    return;
  }

  const product = new Product(req.body);

  product
    .save()
    .then(() => {
      res.json({
        message: "Product created successfully",
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error creating product",
        error: error.message,
      });
    });
}

export async function getAllProducts(req, res) {
  try {
    if (isAdmin(req)) {
      // Product.find()
      // 	.then((products) => {
      // 		res.json(products);
      // 	})
      // 	.catch((error) => {
      // 		res.status(500).json({
      // 			message: "Error fetching products",
      // 			error: error.message,
      // 		});
      // 	});

      // Using async-await

      const products = await Product.find();
      res.json(products);
    } else {
      Product.find({ isAvailable: true })
        .then((products) => {
          res.json(products);
        })
        .catch((error) => {
          res.status(500).json({
            message: "Error fetching products",
            error: error.message,
          });
        });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error fetching products",
      error: error,
    });
  }
}

export function deleteProduct(req, res) {
  if (!isAdmin(req)) {
    res.status(403).json({
      message: "Only admin can delete products",
    });
    return;
  }

  const productID = req.params.productID;

  Product.deleteOne({ productID: productID }).then(() => {
    res.json({
      message: "Product deleted successfully",
    });
  });
}

export function updateProduct(req, res) {
  if (!isAdmin(req)) {
    res.status(403).json({
      message: "Only admin can update products",
    });
    return;
  }

  const productID = req.params.productID;

  Product.updateOne({ productID: productID }, req.body).then(() => {
    res.json({
      message: "Product updated successfully",
    });
  });
}

export function getProductByID(req, res) {
  const productID = req.params.productID;

  Product.findOne({ productID: productID })
    .then((product) => {
      if (product == null) {
        res.status(404).json({
          message: "Product not found",
        });
      } else {
        if (product.isAvailable) {
          res.json(product);
        } else {
          if (isAdmin(req)) {
            res.json(product);
          } else {
            res.status(404).json({
              message: "Product not found",
            });
          }
        }
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error fetching product",
        error: error.message,
      });
    });
}

export async function searchProducts(req, res) {
  const query = req.params.query;

  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { altNames: { $elemMatch: { $regex: query, $options: "i" } } },
      ],
      isAvailable: true,
    });

    return res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Error searching products",
      error: error.message,
    });
  }
}

export async function filterProducts(req, res) {
  const { category, minPrice, maxPrice } = req.query;

  try {
    const filter = {
      isAvailable: true,
    };

    if (category && category !== "all") {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    const products = await Product.find(filter);

    return res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Error filtering products",
      error: error.message,
    });
  }
}

export async function getProductCategories(req, res) {
  try {
    const categories = await Product.distinct("category");
    return res.json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching categories",
      error: error.message,
    });
  }
}

// add try catch for async-await
