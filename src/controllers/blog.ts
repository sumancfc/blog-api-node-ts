import { Request, RequestHandler, Response } from "express";
import formidable, { Fields, Files } from "formidable";
import { promises as fsPromises } from "fs";
import { Blog } from "../models/blogModel";
import { smartTrim, stripHtmlTags } from "../helpers/blog";
import { Category } from "../models/categoryModel";
import { Tag } from "../models/tagModel";
import asyncHandler from "express-async-handler";
import { ICategory, ITag } from "../interfaces";
import { IBlog, BlogRequest } from "../interfaces/blog";
import { IUser } from "../interfaces/user";
import slugify from "slugify";

// Create blog
export const createBlog = async (
    req: Request,
    res: Response
): Promise<void> => {
    let form = formidable({
        multiples: true,
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024,
    });

    form.parse(req, async (err: Error | null, fields: Fields, files: Files) => {
        if (err) {
            res.status(400).json({ error: "Error processing form" });
            return;
        }

        const { title, body, categories, tags } =
            fields as unknown as BlogRequest;

        // Convert title and body to string, regardless of its current type
        const titleStr: string = Array.isArray(title) ? title[0] : title;
        let bodyContent: string =
            typeof body === "string" ? body : String(body);

        // Validation
        if (!titleStr || titleStr.length < 1) {
            res.status(400).json({ error: "Title is required" });
            return;
        }
        if (!body || bodyContent.length < 30) {
            res.status(400).json({ error: "Content is too short" });
            return;
        }
        if (!categories || categories.length === 0) {
            res.status(400).json({
                error: "At least one category is required",
            });
            return;
        }
        if (!tags || tags.length === 0) {
            res.status(400).json({ error: "At least one tag is required" });
            return;
        }

        const slug: string = slugify(titleStr).toLowerCase();
        const { _id } = req.user as IUser;

        const slugExists = await Blog.findOne({ slug });

        if (slugExists) {
            res.status(409).json({ message: "Title Already Present" });
            return;
        }

        // Create a new blog document
        const blog = new Blog();
        blog.title = titleStr;
        blog.slug = slug;
        blog.body = bodyContent;
        blog.excerpt = smartTrim(bodyContent, 120, " ", "...");
        if (blog.excerpt.length > 120) {
            blog.excerpt = blog.excerpt.substring(0, 120 - 3) + "...";
        }
        blog.metaTitle = `${title} | React Next Blog`;
        blog.metaDescription = stripHtmlTags(bodyContent.substring(0, 160));
        blog.postedBy = _id;

        try {
            // Fetch category IDs based on slugs
            const categoryIds = await Category.find({
                slug: { $in: categories },
            }).select("_id");
            blog.categories = categoryIds.map((category) => category._id);

            // Fetch tag IDs based on slugs
            const tagIds = await Tag.find({ slug: { $in: tags } }).select(
                "_id"
            );
            blog.tags = tagIds.map((tag) => tag._id);
        } catch (error) {
            return res
                .status(400)
                .json({ error: "Error fetching categories or tags" });
        }

        // Handle photo upload (if exists)
        if (files.photo && Array.isArray(files.photo)) {
            const photoFile: formidable.File = files.photo[0]; // assuming it's a single file
            const fileBuffer = await fsPromises.readFile(photoFile.filepath); // Read file to buffer
            blog.photo = {
                data: fileBuffer,
                contentType: photoFile.mimetype || "image/jpeg", // Default to 'image/jpeg' if mimetype is not available
            };
        }

        const savedBlog = await blog.save();
        res.status(201).json(savedBlog);
    });
};

// Get All Blogs
export const getAllBlogs: RequestHandler = asyncHandler(async (req, res) => {
    const { pageNumber, keyword } = req.query;

    const pageSize: number = 3;
    const page: number = Number(pageNumber) || 1;
    const newKeyword = keyword
        ? {
              $or: [
                  { title: { $regex: keyword, $options: "i" } },
                  { body: { $regex: keyword, $options: "i" } },
              ],
          }
        : {};
    const count: number = await Blog.countDocuments({ ...newKeyword });
    const skip: number = pageSize * (page - 1);

    const blogs = await Blog.find({ ...newKeyword })
        .populate<{ categories: ICategory[] }>("categories", "_id name slug")
        .populate<{ tags: ITag[] }>("tags", "_id name slug")
        .populate("postedBy", "_id name username")
        .select(
            "_id title slug body excerpt categories tags postedBy createdAt updatedAt"
        )
        .limit(pageSize)
        .skip(skip);

    res.status(200).json({
        count,
        page,
        pages: Math.ceil(count / pageSize),
        blogs,
    });
});

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
