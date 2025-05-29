import { wishListModel } from "../../Model/WishList.js";

export const addToWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    let wishList = await wishListModel.findOne({ userId });

    if (!wishList) {
      wishList = new wishListModel({ userId, products: [{ productId }] });
    } else {
      const productExists = wishList.products.find(
        (p) => p.productId.toString() === productId
      );

      if (!productExists) {
        wishList.products.push({ productId });
      }
    }

    await wishList.save();
    res.status(200).json({ message: "Added to wishlist", data: wishList, success: true });
  } catch (err) {
    res.status(500).json({ message: "Error adding to wishlist", error: err.message });
  }
};


export const getWishlist =async (req, res) => {
  const userId = req.userId;

  try {
    const wishlist = await wishListModel.findOne({ userId }).populate('products.productId');

    if (!wishlist || !wishlist.products || wishlist.products.length === 0) {
      return res.status(200).json({
        data: [],
        count: 0,
        success: true,
        message: 'Wishlist is empty',
      });
    }

    const count = wishlist.products.length;


    const formattedWishlist = wishlist.products
  .filter((item) => item.productId) // ← اتأكد إنه مش null
  .map((item) => {
    const product = item.productId;
    return {
      _id: product._id,
      name: product.name,
      price: product?.sizes?.[0]?.price || 0,
      images: product.images,
      description: product.description,
        sizes: product.sizes 
    };
  });


    res.status(200).json({
      data: formattedWishlist,
      count,
      success: true,
    });
  } catch (error) {
    console.error("❌ Error in getWishlist:", error);
    res.status(500).json({ message: 'Server error', success: false });
  }
};


export const deleteProductFromWishlist = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;

  try {
    const updatedWishlist = await wishListModel.findOneAndUpdate(
      { userId },
      { $pull: { products: { productId: id } } },
      { new: true }
    ).populate('products.productId');

    if (!updatedWishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    res.status(200).json({
      message: 'Item removed from wishlist',
      data: updatedWishlist,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};