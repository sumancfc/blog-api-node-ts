/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API to manage categories
 */

// Create Category
/**
 * @swagger
 * /category:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully created category
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

// Get All Categories
/**
 * @swagger
 * /category/all:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Successfully retrieved categories
 */

// Get Category by Slug
/**
 * @swagger
 * /category/{slug}:
 *   get:
 *     summary: Get a single category by slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: The slug of the category
 *     responses:
 *       200:
 *         description: Successfully retrieved category
 *       404:
 *         description: Category not found
 */

// Update Category by id
/**
 * @swagger
 * /category/{id}:
 *   put:
 *     summary: Update a category by ID
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated category
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 */

// Delete Category by id
/**
 * @swagger
 * /category/{id}:
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the category
 *     responses:
 *       200:
 *         description: Successfully updated category
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 */
