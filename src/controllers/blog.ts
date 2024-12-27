import { Request, Response } from "express";
import {
  IncomingForm,
  File as FormidableFile,
  Fields,
  Files,
} from "formidable";
import slugify from "slugify";
// import { stripHtml } from "string-strip-html";
import fs from "fs";
import Blog, { IBlog } from "../models/blogModel";
import { smartTrim } from "../helpers/blog";
// const _ = require("lodash");
import Category from "../models/categoryModel";
import Tag from "../models/tagModel";
import { handleError } from "../utils";
// const { buildCheckFunction } = require("express-validator");

async function stripHtml(html: string): Promise<{ result: string }> {
  const { stripHtml } = await import("string-strip-html");
  return stripHtml(html);
}

interface BlogFields {
  title: string;
  body: string;
  categories: string;
  tags: string;
}

interface BlogFiles {
  photo?: FormidableFile;
}

// Create blog
export const createBlog = (req: Request, res: Response): void => {
  const form = new IncomingForm({ multiples: true, keepExtensions: true });

  form.parse(req, async (err: Error | null, fields: Fields, files: Files) => {
    if (err) {
      res.status(400).json({ error: "Image could not upload" });
      return;
    }

    const { title, body, categories, tags } = fields as unknown as BlogFields;

    // Validation
    if (!title || title.length < 1) {
      res.status(400).json({ error: "Title is required" });
      return;
    }
    if (!body || body.length < 30) {
      res.status(400).json({ error: "Content is too short" });
      return;
    }
    if (!categories || categories.length === 0) {
      res.status(400).json({ error: "At least one category is required" });
      return;
    }
    if (!tags || tags.length === 0) {
      res.status(400).json({ error: "At least one tag is required" });
      return;
    }

    try {
      const blog = new Blog();
      blog.title = title;
      blog.slug = slugify(title).toLowerCase();
      blog.body = body;
      blog.excerpt = smartTrim(body, 120, " ", "...");
      blog.metaTitle = `${title} | React Next Blog`;
      blog.metaDescription = (await stripHtml(body.substring(0, 160))).result;
      blog.postedBy = req.user._id;

      const categoriesArray = categories.split(",");
      const tagsArray = tags.split(",");

      // const blogFiles = files as unknown as BlogFiles;
      // if (blogFiles.photo) {
      //   if (blogFiles.photo.size > 2000000) {
      //     res.status(400).json({ error: "Image should be less than 2MB" });
      //     return;
      //   }
      //   // blog.photo.data = fs.readFileSync(blogFiles.photo.path);
      //   blog.photo.data = await fs.promises.readFile(blogFiles.photo.filepath);
      //   blog.photo.contentType = blogFiles.photo.type;
      // }

      const savedBlog: IBlog = await blog.save();

      console.log(savedBlog);

      res.status(200).json(savedBlog);

      // const updatedBlogWithCategories = await Blog.findByIdAndUpdate(
      //   savedBlog._id,
      //   { $push: { categories: categoriesArray } },
      //   { new: true }
      // ).exec();

      // if (!updatedBlogWithCategories) {
      //   res.status(400).json({ error: "Could not update categories" });
      //   return;
      // }

      // const updatedBlogWithTags = await Blog.findByIdAndUpdate(
      //   updatedBlogWithCategories._id,
      //   { $push: { tags: tagsArray } },
      //   { new: true }
      // ).exec();

      // if (!updatedBlogWithTags) {
      //   res.status(400).json({ error: "Could not update tags" });
      //   return;
      // }

      // res.json(updatedBlogWithTags);
    } catch (err) {
      handleError(res, err);
    }
  });
};

// //get all blogs
// exports.getAllBlogs = async (req, res) => {
//   try {
//     const blogs = await Blog.find({})
//       .populate("categories", "_id name slug")
//       .populate("tags", "_id name slug")
//       .populate("postedBy", "_id name username")
//       .select(
//         "_id title slug body excerpt categories tags postedBy createdAt updatedAt"
//       )
//       .sort({ createdAt: -1 })
//       .exec();

//     res.status(200).json(blogs);
//   } catch (err) {
//     res.status(400).json({ error: errorHandler(err) });
//   }
// };

// //get all blogs, categories, tags
// exports.getAllBlogsCatsTags = async (req, res) => {
//   try {
//     let limit = req.body.limit ? parseInt(req.body.limit) : 10;
//     let skip = req.body.skip ? parseInt(req.body.skip) : 0;

//     let blogs, categories, tags;

//     const allBlogs = await Blog.find({})
//       .populate("categories", "_id name slug")
//       .populate("tags", "_id name slug")
//       .populate("postedBy", "_id name username")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .select(
//         "_id title slug excerpt categories tags postedBy createdAt updatedAt"
//       )
//       .exec();

//     const allCategories = await Category.find({}).exec();
//     const allTags = await Tag.find({}).exec();

//     blogs = allBlogs;
//     categories = allCategories;
//     tags = allTags;

//     res.status(200).json({ blogs, categories, tags, size: blogs.length });
//   } catch (err) {
//     res.status(400).json({ error: errorHandler(err) });
//   }
// };

// //get single blogs
// exports.getSingleBlog = async (req, res) => {
//   try {
//     const slug = req.params.slug.toLowerCase();

//     const blog = await Blog.findOne({ slug })
//       .populate("categories", "_id name slug")
//       .populate("tags", "_id name slug")
//       .populate("postedBy", "_id name username")
//       .select(
//         "_id title slug excerpt metaTitle metaDescription categories tags postedBy createdAt updatedAt"
//       )
//       .exec();

//     if (!blog) res.status(400).json({ message: "Blog not found" });

//     res.status(200).json(blog);
//   } catch (err) {
//     res.status(400).json({ error: errorHandler(err) });
//   }
// };

// //update blog
// exports.updateBlog = (req, res) => {
//   const slug = req.params.slug.toLowerCase();

//   Blog.findOne({ slug }).exec((err, old) => {
//     if (err) res.status(400).json({ error: errorHandler(err) });

//     let form = new formidable.IncomingForm();
//     form.keepExtensions = true;
//     form.parse(req, (err, fields, files) => {
//       if (err) res.status(400).json({ error: "Image could not upload" });

//       let oldSlug = old.slug;
//       old = _.merge(old, fields);
//       old.slug = oldSlug;

//       const { body, metaDescription, categories, tags } = fields;

//       if (body) {
//         old.excerpt = smartTrim(body, 120, " ", "...");
//         old.metaDescription = stripHtml(body.substring(0, 100));
//       }

//       if (categories) {
//         old.categories = categories.split(",");
//       }

//       if (tags) {
//         old.tags = tags.split(",");
//       }

//       if (files.photo) {
//         if (files.photo.size > 20000000)
//           res
//             .status(400)
//             .json({ error: "Image should be less then 2mb in size" });

//         old.photo.data = fs.readFileSync(files.photo.path);
//         old.photo.contentType = files.photo.type;
//       }

//       old.save((err, result) => {
//         // console.log(result);
//         if (err) res.status(400).json({ error: errorHandler(err) });

//         res.status(200).json(result);
//       });
//     });
//   });
// };

// //delete blog
// exports.deleteBlog = async (req, res) => {
//   try {
//     const slug = req.params.slug.toLowerCase();

//     const blog = await Blog.findOneAndRemove({ slug }).exec();

//     if (!blog)
//       res
//         .status(400)
//         .json({ message: "Blog not found or already been deleted" });

//     res.status(200).json({ message: "Blog deleted successful" });
//   } catch (err) {
//     res.status(400).json({ error: errorHandler(err) });
//   }
// };

// //get blog photo
// exports.getPhoto = async (req, res) => {
//   try {
//     const slug = req.params.slug.toLowerCase();

//     const blog = await Blog.findOne({ slug }).select("photo").exec();

//     if (!blog) res.status(400).json({ message: "Blog image not found" });

//     res.set("Content-Type", blog.photo.contentType);

//     return res.send(blog.photo.data);
//   } catch (err) {
//     res.status(400).json({ error: errorHandler(err) });
//   }
// };

// //get related blogs
// exports.getRelatedBlogs = async (req, res) => {
//   try {
//     let limit = req.body.limit ? parseInt(req.body.limit) : 4;

//     const { _id, categories } = req.body.blog;

//     const related = await Blog.find({
//       _id: { $ne: _id },
//       categories: { $in: categories },
//     })
//       .limit(limit)
//       .populate("postedBy", "_id anme profile")
//       .select("title slug excerpt postedBy createdAt updatedAt")
//       .exec();

//     if (!related) res.status(400).json({ message: "Blogs not found" });

//     res.status(200).json(related);
//   } catch (err) {
//     res.status(400).json({ error: errorHandler(err) });
//   }
// };

// //search blog
// exports.searchBlogs = async (req, res) => {
//   try {
//     const { search } = req.query;

//     if (search) {
//       const blogs = await buildCheckFunction
//         .find({
//           $or: [
//             { title: { $regex: search, $options: "i" } },
//             {
//               body: { $regex: search, $options: "i" },
//             },
//           ],
//         })
//         .select("-photo -body")
//         .exec();

//       res.status(200).json(blogs);
//     }
//   } catch (err) {
//     res.status(400).json({ error: errorHandler(err) });
//   }
// };
