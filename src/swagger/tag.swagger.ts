/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: API to manage tags
 */

// Create Tag
/**
 * @swagger
 * /tag:
 *   post:
 *     summary: Create a new tag
 *     tags: [Tags]
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
 *         description: Successfully created tag
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

// Get All Tags
/**
 * @swagger
 * /tag/all:
 *   get:
 *     summary: Get all blog-tags
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: Successfully retrieved tags
 */

// Get Tag by Slug
/**
 * @swagger
 * /tag/{slug}:
 *   get:
 *     summary: Get a single tag by slug
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: The slug of the tag
 *     responses:
 *       200:
 *         description: Successfully retrieved tag
 *       404:
 *         description: Tag not found
 */

// Update Tag by id
/**
 * @swagger
 * /tag/{id}:
 *   put:
 *     summary: Update a tag by ID
 *     tags: [Tags]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the tag
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
 *         description: Successfully updated tag
 *       404:
 *         description: Tag not found
 *       401:
 *         description: Unauthorized
 */

// Delete Tag by id
/**
 * @swagger
 * /tag/{id}:
 *   delete:
 *     summary: Delete a Tag by ID
 *     tags: [Tags]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the tag
 *     responses:
 *       200:
 *         description: Successfully updated tag
 *       404:
 *         description: Tag not found
 *       401:
 *         description: Unauthorized
 */
