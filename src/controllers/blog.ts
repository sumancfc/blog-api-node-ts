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
const { buildCheckFunction } = require("express-validator");

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
        "_id title slug body excerpt categories tags postedBy createdAt updatedAt"
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
      .populate("postedBy", "_id name username")
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

    res.status(200).json({ blogs, categories, tags, size: blogs.length });
  } catch (err) {
    res.status(400).json({ error: errorHandler(err) });
  }
};

//get single blogs
exports.getSingleBlog = async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();

    const blog = await Blog.findOne({ slug })
      .populate("categories", "_id name slug")
      .populate("tags", "_id name slug")
      .populate("postedBy", "_id name username")
      .select(
        "_id title slug excerpt metaTitle metaDescription categories tags postedBy createdAt updatedAt"
      )
      .exec();

    if (!blog) res.status(400).json({ message: "Blog not found" });

    res.status(200).json(blog);
  } catch (err) {
    res.status(400).json({ error: errorHandler(err) });
  }
};

//update blog
exports.updateBlog = (req, res) => {
  const slug = req.params.slug.toLowerCase();

  Blog.findOne({ slug }).exec((err, old) => {
    if (err) res.status(400).json({ error: errorHandler(err) });

    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
      if (err) res.status(400).json({ error: "Image could not upload" });

      let oldSlug = old.slug;
      old = _.merge(old, fields);
      old.slug = oldSlug;

      const { body, metaDescription, categories, tags } = fields;

      if (body) {
        old.excerpt = smartTrim(body, 120, " ", "...");
        old.metaDescription = stripHtml(body.substring(0, 100));
      }

      if (categories) {
        old.categories = categories.split(",");
      }

      if (tags) {
        old.tags = tags.split(",");
      }

      if (files.photo) {
        if (files.photo.size > 20000000)
          res
            .status(400)
            .json({ error: "Image should be less then 2mb in size" });

        old.photo.data = fs.readFileSync(files.photo.path);
        old.photo.contentType = files.photo.type;
      }

      old.save((err, result) => {
        // console.log(result);
        if (err) res.status(400).json({ error: errorHandler(err) });

        res.status(200).json(result);
      });
    });
  });
};

//delete blog
exports.deleteBlog = async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();

    const blog = await Blog.findOneAndRemove({ slug }).exec();

    if (!blog)
      res
        .status(400)
        .json({ message: "Blog not found or already been deleted" });

    res.status(200).json({ message: "Blog deleted successful" });
  } catch (err) {
    res.status(400).json({ error: errorHandler(err) });
  }
};

//get blog photo
exports.getPhoto = async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();

    const blog = await Blog.findOne({ slug }).select("photo").exec();

    if (!blog) res.status(400).json({ message: "Blog image not found" });

    res.set("Content-Type", blog.photo.contentType);

    return res.send(blog.photo.data);
  } catch (err) {
    res.status(400).json({ error: errorHandler(err) });
  }
};

//get related blogs
exports.getRelatedBlogs = async (req, res) => {
  try {
    let limit = req.body.limit ? parseInt(req.body.limit) : 4;

    const { _id, categories } = req.body.blog;

    const related = await Blog.find({
      _id: { $ne: _id },
      categories: { $in: categories },
    })
      .limit(limit)
      .populate("postedBy", "_id anme profile")
      .select("title slug excerpt postedBy createdAt updatedAt")
      .exec();

    if (!related) res.status(400).json({ message: "Blogs not found" });

    res.status(200).json(related);
  } catch (err) {
    res.status(400).json({ error: errorHandler(err) });
  }
};

//search blog
exports.searchBlogs = async (req, res) => {
  try {
    const { search } = req.query;

    if (search) {
      const blogs = await buildCheckFunction
        .find({
          $or: [
            { title: { $regex: search, $options: "i" } },
            {
              body: { $regex: search, $options: "i" },
            },
          ],
        })
        .select("-photo -body")
        .exec();

      res.status(200).json(blogs);
    }
  } catch (err) {
    res.status(400).json({ error: errorHandler(err) });
  }
};
