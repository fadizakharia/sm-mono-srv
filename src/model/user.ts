import mongoose from "mongoose";
export interface IUserAttr {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  friends: string[] | IUser[];
}
export interface IUser extends mongoose.Document {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  friends: string[] | IUser[];
}
interface userModel extends mongoose.Model<IUser> {
  build(attrs: IUserAttr): IUser;
}
export const UserSchema = new mongoose.Schema(
  {
    first_name: { type: mongoose.SchemaTypes.String, required: true },
    last_name: { type: mongoose.SchemaTypes.String, required: true },
    email: { type: mongoose.SchemaTypes.String, required: true },
    password: { type: mongoose.SchemaTypes.String, required: true },
    friends: [{ type: mongoose.SchemaTypes.ObjectId, ref: "User" }],
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret._id;
        ret.id = doc.id;
      },
      versionKey: false,
    },
    timestamps: true,
  }
);
UserSchema.index({ first_name: "text", last_name: "text", email: "text" });
const User = mongoose.model<IUser, userModel>("User", UserSchema);
export default User;
