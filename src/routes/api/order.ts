import { Router, Response } from "express";
import { check, validationResult } from "express-validator/check";
import HttpStatusCodes from "http-status-codes";

import auth from "../../middleware/auth";
import Order, { IOrder } from "../../models/Order";
import Request from "../../types/Request";
import User, { IUser } from "../../models/User";

const router: Router = Router();

// @route   POST api/order
// @desc    Create or update order
// @access  Private
router.post(
  "/",
  [
    auth,
    check("address", "Address is required").not().isEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }

    const { _id, address } = req.body;

    // Build order object based on IOrder
    const orderFields = {
      user: req.userId,
      address,
    };

    try {
      let user: IUser = await User.findOne({ _id: req.userId });

      if (!user) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          errors: [
            {
              msg: "User not registered",
            },
          ],
        });
      }

      let order: IOrder = await Order.findOne({ _id: _id });
      if (order) {
        // Update
        order = await Order.findOneAndUpdate(
          { user: req.userId },
          { $set: orderFields },
          { new: true }
        );

        return res.json(order);
      }

      // Create
      order = new Order(orderFields);

      await order.save();

      res.json(order);
    } catch (err) {
      console.error(err.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
    }
  }
);

// @route   GET api/order
// @desc    Get all orders
// @access  Public
router.get("/", async (_req: Request, res: Response) => {
  console.log('Get all orders....');
  
  try {
    const orders = await Order.find().populate("user", ["email"]);
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// @route   GET api/order/:orderId
// @desc    Get order by orderId
// @access  Public
router.get("/:orderId", async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
    }).populate("user", ["email"]);

    if (!order)
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ msg: "Order not found" });

    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ msg: "Order not found" });
    }
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// @route   DELETE api/order
// @desc    Delete order
// @access  Private
router.delete("/:orderId", auth, async (req: Request, res: Response) => {
  try {
    // Remove order
    await Order.findOneAndRemove({ _id: req.params.orderId });

    res.json({ msg: "Order removed" });
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

export default router;
