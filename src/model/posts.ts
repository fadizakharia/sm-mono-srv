import mongoose from "mongoose";
import { IUser } from "./user";
export interface IPostAttr {
  likes: string[] | IUser[];
  author: string | IUser;
  content: string;
}
export interface IPost extends mongoose.Document {
  likes: string[] | IUser[];
  author: string | IUser;
  content: string;
}
interface postModel extends mongoose.Model<IPost> {
  build(attrs: IPostAttr): IPost;
}

export const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "User",
    },
    likes: [{ type: mongoose.SchemaTypes.ObjectId, ref: "User" }],
    content: { type: mongoose.SchemaTypes.String, required: true },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret._id;
        ret.id = doc.id;
      },
      versionKey: false,
    },
    timestamps: true,
  }
);

const Post = mongoose.model<IPost, postModel>("Post", PostSchema);
export default Post;
