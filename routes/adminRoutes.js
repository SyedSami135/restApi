const express = require("express");
const authMiddleware = require("./middleware");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require("jsonwebtoken");
/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin-related endpoints
 */
/**
 * @swagger
 * tags:
 *   - name: User
 *     description: User-related endpoints
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     description: Fetch all registered users (admin only)
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Unauthorized
 */
router.get("/users", authMiddleware, async (req, res) => {
   const userId = req.user.id;
    const admin = await prisma.user.findUnique({ where: { id: userId } });

    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }
  const users = await prisma.user.findMany();
  res.status(200).json({users});
});

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin Login
 *     tags: [Admin]
 *     description: LogIn as admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email,  password]
 *             properties:
 *               email:
 *                 example: "admin@example.com"
 *                 type: string
 *               
 *               password:
 *                 example: "adminpassword" 
 *                 type: string
 *     responses:
 *       201:
 *         description: User Log in successfully
 *       400:
 *         description: Validation error
 */
router.post("/login", async (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email , isAdmin: true }  });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
     
    
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
 
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res
      .status(201)
      .header("Authorization", `Bearer ${token}`)
      .json({ message: "LoggedIn  successfully", token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * @swagger
 * /api/admin/promote/{id}:
 *   put:
 *     summary: Promote a user to admin
 *     tags: [Admin]
 *     description: This endpoint allows an admin to promote a user to admin status.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user to be promoted to admin.
 *         schema:
 *           type: integer
 *           example: 123
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User successfully promoted to admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User successfully promoted to admin"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     isAdmin:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Invalid request, possibly missing parameters or invalid user ID
 *       401:
 *         description: Unauthorized, only admins can promote users
 *       403:
 *         description: Forbidden, the user does not have permission to promote
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.put("/createAdmin/:id", authMiddleware, async (req, res) => {

  try {
    const userId = req.user.id;
    const admin = await prisma.user.findUnique({ where: { id: userId } });

    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }


    const { id } = req.params; // Post ID
  
    
   const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        isAdmin: true,
      },
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }


    res.status(200).json({ message: "User promoted to admin successfully", updatedUser });
  } catch (error) {
    console.error("Error creating Admin:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
