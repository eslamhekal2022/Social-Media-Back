import { CartModel } from "../../Model/Cart.model.js";
import { OrderModel } from "../../Model/Order.model.js";


export const checkOut = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const cart = await CartModel.findOne({ userId }).populate("products.productId");

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalPrice = 0;

    // بناء مصفوفة المنتجات للطلب مع سعر الحجم المناسب
    const orderProducts = cart.products.map(item => {
      const product = item.productId;
      if (!product) return null;

      // نلاقي السعر المناسب حسب الحجم من المصفوفة sizes
      const sizeObj = product.sizes.find(s => s.size === item.size);

      // لو الحجم مش موجود، السعر يساوي 0 (ممكن تعالج الخطأ هنا حسب الحاجة)
      const price = sizeObj ? sizeObj.price : 0;

      const subTotal = price * (item.quantity || 1);
      totalPrice += subTotal;

      return {
        productId: product._id,
        name: product.name,
        image: product.images?.[0] || "",
        size: item.size,
        price,  // سعر الوحدة حسب الحجم
        quantity: item.quantity || 1
      };
    }).filter(Boolean); // تصفي العناصر null لو حصل

    if (orderProducts.length === 0) {
      return res.status(400).json({ message: "No valid products in cart" });
    }

    const newOrder = new OrderModel({
      userId,
      products: orderProducts,
      totalPrice,
      status: "pending"
    });

    await newOrder.save();

    // بعد حفظ الطلب، نمسح الكارت
    cart.products = [];
    await cart.save();

    res.status(201).json({
      message: "Order placed successfully",
      success: true,
      order: newOrder
    });

  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ message: "Checkout failed", success: false, error: err.message });
  }
};


export const getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find({})
      .populate('userId', 'name email phone') // لو حابب تعرض بيانات المستخدم
      .populate('products.productId'); // جلب تفاصيل المنتجات

      const count=orders.length
    res.status(200).json({
      message: "All orders retrieved successfully.",
      success: true,
      data: orders,
      count
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve orders.",
      success: false,
      error: error.message
    });
  }
};



export const getUserOrders = async (req, res) => {
  const userId = req.userId;

  try {
    const orders = await OrderModel.find({ userId })
      .populate('userId', 'name email phone');  // ما تعطلش populate للمنتجات عشان السعر والحجم موجودين في الأوردر

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        data: [],
        count: 0,
        success: true,
        message: 'No orders found for this user.',
      });
    }

    const formattedOrders = orders.map(order => {
      const formattedProducts = order.products.map(item => ({
        _id: item.productId,
        name: item.name,
        price: item.price,     // السعر المحفوظ في الأوردر
        size: item.size,       // الحجم المحفوظ في الأوردر
        images: item.image ? [item.image] : [],  // صورة المنتج من الأوردر
        quantity: item.quantity || 1,
      }));

      return {
        products: formattedProducts,
        totalPrice: order.totalPrice,
        status: order.status,
        userInfo: order.userId,
        createdAt: order.createdAt,
      };
    });

    return res.status(200).json({
      data: formattedOrders,
      count: formattedOrders.length,
      success: true,
    });

  } catch (error) {
    console.error("❌ Error in getUserOrders:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};



export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new:true}
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, message: "Order status updated", data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
  }
};


export const deleteAllOrders = async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized", success: false });
    }

    await OrderModel.deleteMany({});
    res.status(200).json({
      message: "All orders have been deleted successfully.",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete orders.",
      success: false,
      error: error.message,
    });
  }
};
export const deleteorder = async (req, res) => {
  const {id}=req.params
try {
  const product=await OrderModel.findByIdAndDelete(id)
res.status(200).json({message:"sex delete",product,success:true})
} catch (error) {
  console.log(error)
}  
}

export const OrderDet = async (req, res) => {
try {
  const {id}=req.params
  const order=await OrderModel.findById(id)

  res.status(200).json({message:"Takeorder",success:true,data:order})
} catch (error) {
  console.log(error)
}
}