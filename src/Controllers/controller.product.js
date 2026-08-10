const ProductModel = require("../Models/ProductModel");
const client = require("../service/storage");
 

const createProduct = async (req, res) => {
    try {

        const { name, description, price, category } = req.body;

        if (!name || !description || !price || !category) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if(!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one image is required" });
        }

        const imagesBlock = req.files.map((file) => {
  return client.files.upload({
    file: file.buffer.toString("base64"),
    fileName: file.originalname,
    folder: "/SpecificProducts",
  });
});
        console.log("imagesBlock:", imagesBlock);
        const results = await Promise.all(imagesBlock);
        console.log(JSON.stringify(results, null, 2));
    const images = results.map((result) => ({
      url: result.url,
      fileId: result.fileId,
    }));


    const product = await ProductModel.create({
        name,
        description,
        price,
        category,
        images,
    });


    res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

const findALLProducts = async (req, res) => {
    try {
    const products = await ProductModel.find().sort({ createdAt: -1 }); // Sort by creation date, newest first
     res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

const findProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        res.status(200).json({
            success: true,
            product,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

const deleteProductById = async (req, res) => {
    try {

        const productId = req.params.id;

        const product = await ProductModel.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Delete images from ImageKit

        console.log("Product images:", product.images);

        const deleteImagePromises = product.images.map((image) => {
              console.log("Deleting fileId:", image.fileId);

            return client.files.delete(image.fileId);
        });

        await Promise.all(deleteImagePromises);

        await ProductModel.findByIdAndDelete(productId);

        res.status(200).json({ message: "Product deleted successfully" });


    } catch (error) {
         
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


const updateProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    const { name, description, price, category } = req.body;

    // 1. Find existing product
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // 2. Update basic product information
    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category;

    // 3. Check if new images were uploaded
    if (req.files && req.files.length > 0) {
      
      // Upload new images
      const uploadPromises = req.files.map((file) =>
        client.files.upload({
          file: file.buffer.toString("base64"),
          fileName: file.originalname,
          folder: "/SpecificProducts",
        })
      );

      const results = await Promise.all(uploadPromises);

      console.log(
        "New uploaded images:",
        JSON.stringify(results, null, 2)
      );

      // 4. Create new images array
      const newImages = results.map((result) => ({
        url: result.url,
        fileId: result.fileId,
      }));

      // 5. Delete old images from ImageKit
      if (product.images && product.images.length > 0) {
        const deleteImagePromises = product.images
          .filter((image) => image.fileId)
          .map((image) =>
            client.files.delete(image.fileId)
          );

        await Promise.all(deleteImagePromises);
      }

      // 6. Replace old images with new images
      product.images = newImages;
    }

    // 7. Save product
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });

  } catch (error) {
    console.error("Update Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided." });
    }

    // Step 1: JWT verify karein (signature + expiry check)
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.JWT_SECRET);
    } catch (err) {
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token." });
    }

    // Step 2: DB mein us user ka saved hash nikal kar match karein
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const user = await User.findById(decoded.id).select("+refreshTokenHash");

    if (!user || user.refreshTokenHash !== refreshTokenHash) {
      return res
        .status(403)
        .json({ message: "Refresh token revoked. Please login again." });
    }

    // Step 3: Sab theek — naya access token bana kar bhej dein
    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: "15m" },
    );

    return res.status(200).json({
      message: "Access token refreshed",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.log("REFRESH TOKEN ERROR:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { createProduct, findALLProducts, findProductById, deleteProductById, updateProductById, refreshAccessToken };