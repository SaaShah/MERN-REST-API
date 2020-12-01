import { Document, Model, model, Schema } from "mongoose";
import { IUser } from "./User";

/**
 * Interface to model the Order Schema for TypeScript.
 * @param user:ref => User._id
 * @param address:string
 */
export interface IOrder extends Document {
  user: IUser["_id"];
  address: string;
  items: [{ name: 'string' }];
}

const orderSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  address: {
    type: String,
    required: true
  },
  items: {
    type: Schema.Types.Array,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Order: Model<IOrder> = model("Order", orderSchema);

export default Order;
