const express = require("express");
const authMiddleware = require("./middleware");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

// ---------------- CREATE POST ----------------

/**
 * @swagger
 * /api/user/posts:
 *   post:
 *     summary: Create a new post
 *     description: This endpoint allows an authenticated user to create a new post.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Provide title and content for the post
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My New Post"
 *               content:
 *                 type: string
 *                 example: "This is the content of my post"
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post created successfully"
 *                 post:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "My New Post"
 *                     content:
 *                       type: string
 *                       example: "This is the content"
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, async (req, res) => {
  const { title, content } = req.body;

  // Check for required fields
  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  try {
    const userId = req.user.id; // Authenticated user's ID

    // Create the post
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        authorId: userId,
      },
    });

    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// ---------------- UPDATE POST ----------------
/**
 * @swagger
 * /api/user/posts/{id}:
 *   put:
 *     summary: Update an existing post
 *     description: This endpoint allows an authenticated user to update a specific post by its ID.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the post to update
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       description: Provide updated title and content for the post
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Post Title"
 *               content:
 *                 type: string
 *                 example: "This is the updated content of the post"
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post updated successfully"
 *                 post:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Updated Post Title"
 *                     content:
 *                       type: string
 *                       example: "This is the updated content of the post"
 *       400:
 *         description: Missing fields or invalid data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */

router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params; // Post ID
  const { title, content } = req.body;

  if (!title && !content) {
    return res.status(400).json({ message: "At least one field (title or content) is required to update" });
  }

  try {
    const userId = req.user.id;

    // Find the post
    const post = await prisma.post.findUnique({ where: { id: parseInt(id) } });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the logged-in user is the owner of the post
    if (post.authorId !== userId) {
      return res.status(403).json({ message: "You are not authorized to update this post" });
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        title: title || post.title,
        content: content || post.content,
      },
    });

    res.status(200).json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// ---------------- DELETE POST ----------------

/**
 * @swagger
 * /api/user/posts/{id}:
 *   delete:
 *     summary: Delete an existing post
 *     description: This endpoint allows an authenticated user to delete a specific post by its ID.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the post to delete
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post deleted successfully"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */

router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params; // Post ID

  try {
    const userId = req.user.id;

    // Find the post
    const post = await prisma.post.findUnique({ where: { id: parseInt(id) } });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the logged-in user is the owner of the post
    if (post.authorId !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this post" });
    }

    // Delete the post
    await prisma.post.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});
// ---------------- CREATE Comment ----------------
/**
 * @swagger
 * /api/user/posts/{postId}/comments:
 *   post:
 *     summary: Create a new comment
 *     description: This endpoint allows an authenticated user to create a comment on a specific post.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         description: The ID of the post to comment on
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       description: Provide content for the comment
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This is a comment on the post"
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment created successfully"
 *                 comment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     content:
 *                       type: string
 *                       example: "This is a comment on the post"
 *                     postId:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Missing content
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */

router.post('/posts/:postId/comments', authMiddleware, async (req, res) => {
  const { content } = req.body;
  const { postId } = req.params;

  if (!content) {
    return res.status(400).json({ message: 'Content is required' });
  }

  try {
    const userId = req.user.id; // Authenticated user's ID

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Create the comment
    const newComment = await prisma.comment.create({
      data: {
        content,
        postId: Number(postId),
        userId,
      },
    });

    res.status(201).json({
      message: 'Comment created successfully',
      comment: newComment,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});


// ---------------- UPDATE COMMENT ----------------
/**
/**
 * @swagger
 * /api/user/comments/{id}:
 *   put:
 *     summary: Update an existing comment
 *     description: This endpoint allows an authenticated user to update a specific comment by its ID.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the comment to update
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       description: Provide updated content for the comment
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This is the updated content for the comment"
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment updated successfully"
 *                 comment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     content:
 *                       type: string
 *                       example: "This is the updated content for the comment"
 *                     postId:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Missing content or invalid data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */

router.put('/comments/:id', authMiddleware, async (req, res) => {
  const { content } = req.body;
  const { id } = req.params;

  if (!content) {
    return res.status(400).json({ message: 'Content is required' });
  }

  try {
    const userId = req.user.id; // Authenticated user's ID

    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id: Number(id) },
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user is the author of the comment
    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: { id: Number(id) },
      data: { content },
    });

    res.status(200).json({
      message: 'Comment updated successfully',
      comment: updatedComment,
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// ---------------- DELETE COMMENT ----------------
/**
 * @swagger
 * /api/user/comments/{id}:
 *   delete:
 *     summary: Delete an existing comment
 *     description: This endpoint allows an authenticated user to delete a specific comment by its ID.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the comment to delete
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment deleted successfully"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */

router.delete('/comments/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const userId = req.user.id; // Authenticated user's ID

    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id: Number(id) },
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user is the author of the comment
    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});


module.exports = router;
