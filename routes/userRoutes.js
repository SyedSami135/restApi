const express = require("express");
const Joi = require("joi");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();



/**
 * @swagger
 * /api/user/signup:
 *   post:
 *     summary: User signup
 *     description: This endpoint allows  new user to sign up by providing email and password.
 *     tags:
 *       - User
 *     requestBody:
 *       description: Provide the email and password for user authentication.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               country:
 *                 type: string
 *                 example: "china"
 *               firstName:
 *                 type: string
 *                 example: "john"
 *               name:
 *                 type: string
 *                 example: "john Doe"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNjMyOTMwODAwfQ.TG0wYs8cZZwLlnsOdT-kpxzBZ0lHMQItNJ9VR64pOCU"
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 *       500:
 *         description: Something went wrong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong"
 */

router.post("/signup", async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    firstName: Joi.string().required(),
    email: Joi.string().email().required(),
    country: Joi.string().required(),
    password: Joi.string().min(6).required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const { name, firstName, email, country, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return res.status(400).json({ message: "User already exists" ,token });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the provided data
    const newUser = await prisma.user.create({
      data: {
        name,
        firstName,
        email,
        country,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res
      .status(201)
      .header("Authorization", `Bearer ${token}`)
      .json({ message: "User created successfully" });
  } catch (error) {
    return res.status(201).json({ message: "Something went wrong" });
  }
});

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: User Login
 *     tags:
 *       - User
 *     description: Create a new user with email verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ email, password]
 *             properties:
 *              
 *               email:
 *                 type: string
 *               
 *               password:
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
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});


module.exports = router;
