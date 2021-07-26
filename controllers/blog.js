const formidable = require("formidable");
const slugify = require("slugify");
const stripHtml = require("string-strip-html");
const _ = require("lodash");
const fs = require("fs");
const Blog = require("../models/blogModel");
const Category = require("../models/categoryModel");
const Tag = require("../models/tagModel");
const { errorHandler } = require("../middlewares/dbErrorHandler");
const { smartTrim } = require("../helpers/blog");

//create blog
exports.createBlog = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) res.status(400).json({ error: "Image could not upload" });

    const { title, body, categories, tags } = fields;

    if (!title || !title.length)
      res.status(400).json({ error: "title is required" });

    if (!body || body.length < 100)
      res.status(400).json({ error: "Content is too short" });

    if (!categories || categories.length === 0)
      res.status(400).json({ error: "At least one category is required" });

    if (!tags || tags.length === 0)
      res.status(400).json({ error: "At least one tag is required" });

    let blog = new Blog();
    blog.title = title;
    blog.slug = slugify(title).toLowerCase();
    blog.body = body;
    blog.excerpt = smartTrim(body, 120, " ", "...");
    blog.metaTitle = `${title} | React Next Blog`;
    blog.metaDescription = stripHtml(body.substring(0, 160));
    blog.postedBy = req.user._id;

    const categoriesArray = categories && categories.split(",");
    const tagsArray = tags && tags.split(",");

    if (files.photo) {
      if (files.photo.size > 20000000)
        res
          .status(400)
          .json({ error: "Image should be less then 2mb in size" });

      blog.photo.data = fs.readFileSync(files.photo.path);
      blog.photo.contentType = files.photo.type;
    }

    blog.save((err, result) => {
      // console.log(result);
      if (err) res.status(400).json({ error: errorHandler(err) });

      Blog.findByIdAndUpdate(
        result._id,
        { $push: { categories: categoriesArray } },
        { new: true }
      ).exec((err, result) => {
        if (err) res.status(400).json({ error: errorHandler(err) });
        else {
          Blog.findByIdAndUpdate(
            result._id,
            { $push: { tags: tagsArray } },
            { new: true }
          ).exec((err, result) => {
            if (err) res.status(400).json({ error: errorHandler(err) });
            else res.json(result);
          });
        }
      });
    });
  });
};

//get all blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({})
      .populate("categories", "_id name slug")
      .populate("tags", "_id name slug")
      .populate("postedBy", "_id name username")
      .select(
        "_id title body excerpt categories tags postedBy createdAt updatedAt"
      )
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json(blogs);
  } catch (err) {
    res.status(400).json({ error: errorHandler(err) });
  }
};

//get all blogs, categories, tags
exports.getAllBlogsCatsTags = async (req, res) => {
  try {
    let limit = req.body.limit ? parseInt(req.body.limit) : 10;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    let blogs, categories, tags;

    const allBlogs = await Blog.find({})
      .populate("categories", "_id name slug")
      .populate("tags", "_id name slug")
      .populate("postedBy", "_id name username profile")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "_id title slug excerpt categories tags postedBy createdAt updatedAt"
      )
      .exec();

    const allCategories = await Category.find({}).exec();
    const allTags = await Tag.find({}).exec();

    blogs = allBlogs;
    categories = allCategories;
    tags = allTags;

    return res.json({ blogs, categories, tags, size: blogs.length });
  } catch (err) {
    res.json({ error: errorHandler(err) });
  }
};
