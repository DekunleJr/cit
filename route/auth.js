const express = require("express");
const { check, body } = require("express-validator");
const User = require("../models/user");

const controller = require("../controller/auth");

const router = express.Router();

/**
 * @swagger
 * /login:
 *   get:
 *     summary: Get login page
 *     tags: [Authentication]
 *     description: Renders the user login page.
 *     responses:
 *       200:
 *         description: Successfully rendered the login page.
 *       500:
 *         description: Server error.
 */
router.get("/login", controller.getLogin);

/**
 * @swagger
 * /signup:
 *   get:
 *     summary: Get signup page
 *     tags: [Authentication]
 *     description: Renders the user signup page.
 *     responses:
 *       200:
 *         description: Successfully rendered the signup page.
 *       500:
 *         description: Server error.
 */
router.get("/signup", controller.getSignup);

/**
 * @swagger
 * /reset:
 *   get:
 *     summary: Get password reset request page
 *     tags: [Authentication]
 *     description: Renders the password reset request page.
 *     responses:
 *       200:
 *         description: Successfully rendered the reset password page.
 *       500:
 *         description: Server error.
 */
router.get("/reset", controller.getReset);

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     description: Registers a new user with email, password, and confirms password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (at least 8 alphanumeric characters).
 *               confirm_password:
 *                 type: string
 *                 format: password
 *                 description: Confirmation of the user's password.
 *             required:
 *               - email
 *               - password
 *               - confirm_password
 *     responses:
 *       200:
 *         description: User registered successfully. Redirects to /login.
 *       422:
 *         description: Validation failed (e.g., invalid email, password mismatch, email already exists).
 *       500:
 *         description: Server error.
 */
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "E-Mail exists already, please pick a different one."
            );
          }
        });
      }),
    body("password", "Enter atleast 8 characters containing numbers and text")
      .isLength({ min: 8 })
      .isAlphanumeric()
      .trim(),
    check("confirm_password")
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Passwords do not match")
      .trim(),
  ],
  controller.postSignup
);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     description: Authenticates a user with email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password.
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User logged in successfully. Redirects to /.
 *       422:
 *         description: Validation failed (e.g., invalid email or password).
 *       401:
 *         description: Invalid credentials.
 *       500:
 *         description: Server error.
 */
router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Please enter a valid email"),
    body("password", "Enter atleast 6 characters containing numbers and text")
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
  ],
  controller.postLogin
);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Log out a user
 *     tags: [Authentication]
 *     description: Logs out the currently authenticated user.
 *     responses:
 *       200:
 *         description: User logged out successfully. Redirects to /.
 *       500:
 *         description: Server error.
 */
router.post("/logout", controller.postLogout);

/**
 * @swagger
 * /reset:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     description: Sends a password reset email to the provided email address.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address for password reset.
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Password reset email sent (or user not found). Redirects to /login.
 *       500:
 *         description: Failed to send reset email or server error.
 */
router.post("/reset", controller.postReset);

/**
 * @swagger
 * /reset/{token}:
 *   get:
 *     summary: Get new password page
 *     tags: [Authentication]
 *     description: Renders the page for setting a new password after a reset request.
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Password reset token.
 *     responses:
 *       200:
 *         description: Successfully rendered the new password page.
 *       404:
 *         description: Invalid or expired token.
 *       500:
 *         description: Server error.
 */
router.get("/reset/:token", controller.getNewPassword);

/**
 * @swagger
 * /password:
 *   post:
 *     summary: Set new password
 *     tags: [Authentication]
 *     description: Sets a new password for the user using a valid reset token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: New password (at least 8 alphanumeric characters).
 *               confirm_password:
 *                 type: string
 *                 format: password
 *                 description: Confirmation of the new password.
 *               userId:
 *                 type: string
 *                 description: Hidden user ID.
 *               passwordToken:
 *                 type: string
 *                 description: Hidden password reset token.
 *             required:
 *               - password
 *               - confirm_password
 *               - userId
 *               - passwordToken
 *     responses:
 *       200:
 *         description: Password successfully reset. Redirects to /login.
 *       422:
 *         description: Validation failed (e.g., password mismatch).
 *       401:
 *         description: Invalid or expired token.
 *       500:
 *         description: Server error.
 */
router.post(
  "/password",
  [
    body("password", "Enter atleast 8 characters containing numbers and text")
      .isLength({ min: 8 })
      .isAlphanumeric()
      .trim(),
    check("confirm_password")
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Passwords do not match")
      .trim(),
  ],
  controller.postNewPassword
);

module.exports = router;
