const express = require("express");
const router = express.Router();
const isAdmin = require("../util/isAdmin");
const isAuth = require("../controller/isAuth");
const controller = require("../controller/home");
const subCon = require("../controller/admin");
const { check, body } = require("express-validator");

/**
 * @swagger
 * tags:
 *   - name: Public
 *     description: Publicly accessible routes
 *   - name: Authentication
 *     description: User authentication and authorization routes
 *   - name: Admin
 *     description: Administrator-only routes for managing content and users
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get home page data
 *     tags: [Public]
 *     description: Renders the home page with a list of events, services, courses, teachers, news, and alumni.
 *     responses:
 *       200:
 *         description: Successfully rendered the home page.
 *       500:
 *         description: Server error.
 */
router.get("/", controller.getindex);

/**
 * @swagger
 * /about:
 *   get:
 *     summary: Get about page
 *     tags: [Public]
 *     description: Renders the about page.
 *     responses:
 *       200:
 *         description: Successfully rendered the about page.
 *       500:
 *         description: Server error.
 */
router.get("/about", controller.getAbout);

/**
 * @swagger
 * /contact:
 *   get:
 *     summary: Get contact page
 *     tags: [Public]
 *     description: Renders the contact page.
 *     responses:
 *       200:
 *         description: Successfully rendered the contact page.
 *       500:
 *         description: Server error.
 */
router.get("/contact", controller.getContact);

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Public]
 *     description: Renders the courses page with a list of all available courses and teachers.
 *     responses:
 *       200:
 *         description: Successfully rendered the courses page.
 *       500:
 *         description: Server error.
 */
router.get("/courses", controller.getCourses);

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Get all services
 *     tags: [Public]
 *     description: Renders the services page with a list of all available services and teachers.
 *     responses:
 *       200:
 *         description: Successfully rendered the services page.
 *       500:
 *         description: Server error.
 */
router.get("/services", controller.getServices);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events
 *     tags: [Public]
 *     description: Renders the events page with a list of all upcoming events.
 *     responses:
 *       200:
 *         description: Successfully rendered the events page.
 *       500:
 *         description: Server error.
 */
router.get("/events", controller.getEvent);

/**
 * @swagger
 * /news:
 *   get:
 *     summary: Get all news articles
 *     tags: [Public]
 *     description: Renders the news page with a list of all news articles.
 *     responses:
 *       200:
 *         description: Successfully rendered the news page.
 *       500:
 *         description: Server error.
 */
router.get("/news", controller.getNews);

/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: Get all teachers
 *     tags: [Public]
 *     description: Renders the teachers page with a list of all teachers.
 *     responses:
 *       200:
 *         description: Successfully rendered the teachers page.
 *       500:
 *         description: Server error.
 */
router.get("/teachers", controller.getTeacher);

/**
 * @swagger
 * /myCourses:
 *   get:
 *     summary: Get user's purchased courses
 *     tags: [Public]
 *     security:
 *       - bearerAuth: []
 *     description: Renders the 'My Courses' page, displaying courses purchased by the authenticated user, along with their subject progress.
 *     responses:
 *       200:
 *         description: Successfully rendered the user's courses page.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
router.get("/myCourses", isAuth, controller.getMyCourses);

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Get admin dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Renders the admin dashboard page, displaying forms for adding content (instructors, events, news, courses, services, alumni) and a list of existing courses for management.
 *     responses:
 *       200:
 *         description: Successfully rendered the admin dashboard.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       500:
 *         description: Server error.
 */
router.get("/admin", isAdmin, controller.getAdmin);

/**
 * @swagger
 * /admin/teacher:
 *   post:
 *     summary: Add a new teacher
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Adds a new teacher to the database. Requires administrator privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the teacher.
 *               profession:
 *                 type: string
 *                 description: Profession of the teacher.
 *               position:
 *                 type: string
 *                 description: Role or position of the teacher.
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file for the teacher.
 *               portUrl:
 *                 type: string
 *                 description: Portfolio URL of the teacher (optional).
 *     responses:
 *       200:
 *         description: Teacher added successfully. Redirects to /teachers.
 *       400:
 *         description: Bad request, e.g., missing image or required fields.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       500:
 *         description: Server error.
 */
router.post("/admin/teacher", controller.postTeachers);

/**
 * @swagger
 * /admin/event:
 *   post:
 *     summary: Add a new event
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Adds a new event to the database. Requires administrator privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the event.
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file for the event.
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of the event.
 *               location:
 *                 type: string
 *                 description: Location of the event.
 *               description:
 *                 type: string
 *                 description: Detailed description of the event.
 *               button:
 *                 type: string
 *                 enum: [reg, course]
 *                 description: Type of button to display (registration or course).
 *     responses:
 *       200:
 *         description: Event added successfully. Redirects to /events.
 *       400:
 *         description: Bad request, e.g., missing image or required fields.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       500:
 *         description: Server error.
 */
router.post("/admin/event", controller.postEvent);

/**
 * @swagger
 * /admin/news:
 *   post:
 *     summary: Add a new news article
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Adds a new news article to the database. Requires administrator privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the news article.
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file for the news article (optional).
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of the news article.
 *               position:
 *                 type: string
 *                 description: Author or position related to the news.
 *               description:
 *                 type: string
 *                 description: Content of the news article.
 *     responses:
 *       200:
 *         description: News article added successfully. Redirects to /news.
 *       400:
 *         description: Bad request, e.g., missing required fields.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       500:
 *         description: Server error.
 */
router.post("/admin/news", controller.postNews);

/**
 * @swagger
 * /admin/course:
 *   post:
 *     summary: Add a new course
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Adds a new course to the database. Requires administrator privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the course.
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file for the course.
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Start date of the course (YYYY-MM-DD).
 *               price:
 *                 type: number
 *                 format: float
 *                 description: Price of the course.
 *               description:
 *                 type: string
 *                 description: Detailed description of the course.
 *     responses:
 *       200:
 *         description: Course added successfully. Redirects to /courses.
 *       400:
 *         description: Bad request, e.g., missing image or required fields.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       500:
 *         description: Server error.
 */
router.post("/admin/course", controller.postCourse);

/**
 * @swagger
 * /admin/service:
 *   post:
 *     summary: Add a new service
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Adds a new service to the database. Requires administrator privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the service.
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file for the service.
 *               description:
 *                 type: string
 *                 description: Detailed description of the service.
 *     responses:
 *       200:
 *         description: Service added successfully. Redirects to /services.
 *       400:
 *         description: Bad request, e.g., missing image or required fields.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       500:
 *         description: Server error.
 */
router.post("/admin/service", controller.postService);

/**
 * @swagger
 * /admin/alumni:
 *   post:
 *     summary: Add an alumni testimonial
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Adds a new alumni testimonial to the database. Requires administrator privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the alumni.
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file for the alumni.
 *               comment:
 *                 type: string
 *                 description: Testimonial comment from the alumni.
 *     responses:
 *       200:
 *         description: Testimonial added successfully. Redirects to /.
 *       400:
 *         description: Bad request, e.g., missing image or required fields.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       500:
 *         description: Server error.
 */
router.post("/admin/alumni", controller.postAlumni);

/**
 * @swagger
 * /send_mail:
 *   post:
 *     summary: Send a contact email
 *     tags: [Public]
 *     description: Sends an email from the contact form.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Sender's name.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Sender's email address.
 *               subject:
 *                 type: string
 *                 description: Subject of the email.
 *               message:
 *                 type: string
 *                 description: Content of the email.
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - message
 *     responses:
 *       200:
 *         description: Email sent successfully. Redirects to /.
 *       500:
 *         description: Failed to send message or server error.
 */
router.post("/send_mail", controller.postEmail);

/**
 * @swagger
 * /delete-news:
 *   post:
 *     summary: Delete a news article
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Deletes a news article by ID. Requires administrator privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               newsId:
 *                 type: string
 *                 description: ID of the news article to delete.
 *             required:
 *               - newsId
 *     responses:
 *       200:
 *         description: News article deleted successfully. Redirects to /news.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       404:
 *         description: News article not found.
 *       500:
 *         description: Server error.
 */
router.post("/delete-news", isAdmin, controller.postDeleteNews);

/**
 * @swagger
 * /delete-event:
 *   post:
 *     summary: Delete an event
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Deletes an event by ID. Requires administrator privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: ID of the event to delete.
 *             required:
 *               - eventId
 *     responses:
 *       200:
 *         description: Event deleted successfully. Redirects to /events.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       404:
 *         description: Event not found.
 *       500:
 *         description: Server error.
 */
router.post("/delete-event", isAdmin, controller.postDeleteEvent);

/**
 * @swagger
 * /delete-teacher:
 *   post:
 *     summary: Delete a teacher
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Deletes a teacher by ID. Requires administrator privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               teacherId:
 *                 type: string
 *                 description: ID of the teacher to delete.
 *             required:
 *               - teacherId
 *     responses:
 *       200:
 *         description: Teacher deleted successfully. Redirects to /teachers.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       404:
 *         description: Teacher not found.
 *       500:
 *         description: Server error.
 */
router.post("/delete-teacher", isAdmin, controller.postDeleteTeacher);

/**
 * @swagger
 * /delete-course:
 *   post:
 *     summary: Delete a course
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Deletes a course by ID. Requires administrator privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: ID of the course to delete.
 *             required:
 *               - courseId
 *     responses:
 *       200:
 *         description: Course deleted successfully. Redirects to /courses.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       404:
 *         description: Course not found.
 *       500:
 *         description: Server error.
 */
router.post("/delete-course", isAdmin, controller.postDeleteCourse);

/**
 * @swagger
 * /delete-service:
 *   post:
 *     summary: Delete a service
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Deletes a service by ID. Requires administrator privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               serviceId:
 *                 type: string
 *                 description: ID of the service to delete.
 *             required:
 *               - serviceId
 *     responses:
 *       200:
 *         description: Service deleted successfully. Redirects to /services.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       404:
 *         description: Service not found.
 *       500:
 *         description: Server error.
 */
router.post("/delete-service", isAdmin, controller.postDeleteService);

/**
 * @swagger
 * /delete-alumni:
 *   post:
 *     summary: Delete an alumni testimonial
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Deletes an alumni testimonial by ID. Requires administrator privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               alumniId:
 *                 type: string
 *                 description: ID of the alumni testimonial to delete.
 *             required:
 *               - alumniId
 *     responses:
 *       200:
 *         description: Alumni testimonial deleted successfully. Redirects to /.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       404:
 *         description: Alumni testimonial not found.
 *       500:
 *         description: Server error.
 */
router.post("/delete-alumni", isAdmin, controller.postDeleteAlumni);

/**
 * @swagger
 * /initialize-payment:
 *   post:
 *     summary: Initialize a payment
 *     tags: [Public]
 *     description: Initializes a payment transaction via Paystack.
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
 *                 description: User's email for payment.
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: Amount to be paid in Naira.
 *               courseId:
 *                 type: string
 *                 description: ID of the course being purchased.
 *             required:
 *               - email
 *               - amount
 *               - courseId
 *     responses:
 *       302:
 *         description: Redirects to Paystack payment page.
 *       500:
 *         description: Failed to initialize payment or server error.
 */
router.post("/initialize-payment", controller.postPayment);

/**
 * @swagger
 * /payment/callback:
 *   get:
 *     summary: Handle payment callback
 *     tags: [Public]
 *     description: Handles the callback from Paystack after a payment attempt. Verifies the payment status and updates user's purchased courses.
 *     parameters:
 *       - in: query
 *         name: reference
 *         schema:
 *           type: string
 *         required: true
 *         description: Paystack transaction reference.
 *     responses:
 *       200:
 *         description: Payment successful or failed, renders payment status page.
 *       500:
 *         description: Error verifying payment or server error.
 */
router.get("/payment/callback", controller.getPayment);

/**
 * @swagger
 * /admin/courses/{courseId}/add-subject:
 *   get:
 *     summary: Get form to add a subject to a course
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Renders a form to add a new subject to a specific course. Requires administrator privileges.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course to add a subject to.
 *     responses:
 *       200:
 *         description: Successfully rendered the add subject form.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       404:
 *         description: Course not found.
 *       500:
 *         description: Server error.
 */
router.get(
  "/admin/courses/:courseId/add-subject",
  isAdmin,
  subCon.getAddSubject
);

/**
 * @swagger
 * /admin/add-subject:
 *   post:
 *     summary: Add a new subject to a course
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Adds a new subject to a specified course. Requires administrator privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the subject.
 *               code:
 *                 type: string
 *                 description: Subject code.
 *               units:
 *                 type: number
 *                 description: Number of units for the subject.
 *               courseId:
 *                 type: string
 *                 description: ID of the course to which the subject will be added.
 *             required:
 *               - title
 *               - code
 *               - units
 *               - courseId
 *     responses:
 *       200:
 *         description: Subject added successfully. Redirects to the course detail page.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       404:
 *         description: Target course not found.
 *       500:
 *         description: Failed to add subject or server error.
 */
router.post("/admin/add-subject", isAdmin, subCon.postAddSubject);

/**
 * @swagger
 * /courses/{courseId}/subjects/{subjectId}/assignments:
 *   get:
 *     summary: Get assignments for a subject
 *     tags: [Public]
 *     security:
 *       - bearerAuth: []
 *     description: Renders the assignments page for a specific subject within a course. Requires user authentication.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course.
 *       - in: path
 *         name: subjectId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the subject.
 *     responses:
 *       200:
 *         description: Successfully rendered the assignments page.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       404:
 *         description: Subject not found.
 *       500:
 *         description: Server error.
 */
router.get(
  "/courses/:courseId/subjects/:subjectId/assignments",
  isAuth, // Anyone logged in can view
  subCon.getAssignments
);

/**
 * @swagger
 * /courses/{courseId}/subjects/{subjectId}/projects:
 *   get:
 *     summary: Get projects for a subject
 *     tags: [Public]
 *     security:
 *       - bearerAuth: []
 *     description: Renders the projects page for a specific subject within a course. Requires user authentication.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course.
 *       - in: path
 *         name: subjectId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the subject.
 *     responses:
 *       200:
 *         description: Successfully rendered the projects page.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       404:
 *         description: Subject not found.
 *       500:
 *         description: Server error.
 */
router.get(
  "/courses/:courseId/subjects/:subjectId/projects",
  isAuth, // Anyone logged in can view
  subCon.getProjects
);

/**
 * @swagger
 * /courses/{courseId}/subjects/{subjectId}/assignments/new:
 *   get:
 *     summary: Get form to add a new assignment
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Renders a form to add a new assignment to a specific subject within a course. Requires administrator privileges.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course.
 *       - in: path
 *         name: subjectId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the subject.
 *     responses:
 *       200:
 *         description: Successfully rendered the add assignment form.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       404:
 *         description: Subject not found.
 *       500:
 *         description: Server error.
 */
router.get(
  "/courses/:courseId/subjects/:subjectId/assignments/new",
  isAdmin,
  subCon.getAddAssignment
);

/**
 * @swagger
 * /courses/{courseId}/subjects/{subjectId}/assignments:
 *   post:
 *     summary: Add a new assignment
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Adds a new assignment to a specific subject within a course. Requires administrator privileges.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course.
 *       - in: path
 *         name: subjectId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the subject.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the assignment.
 *               description:
 *                 type: string
 *                 description: Description of the assignment.
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Due date of the assignment (YYYY-MM-DD).
 *               totalPoints:
 *                 type: number
 *                 description: Total points for the assignment.
 *             required:
 *               - title
 *               - description
 *               - dueDate
 *               - totalPoints
 *     responses:
 *       200:
 *         description: Assignment added successfully. Redirects to the assignments list.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       422:
 *         description: Validation failed.
 *       500:
 *         description: Server error.
 */
router.post(
  "/courses/:courseId/subjects/:subjectId/assignments",
  isAdmin,
  [
    body(
      "title",
      "Assignment title is required and must be at least 3 characters."
    )
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("description", "Description is required.").isLength({ min: 5 }).trim(),
    body("dueDate", "Please enter a valid due date.")
      .isISO8601() // Checks for YYYY-MM-DD format
      .toDate() // Converts valid string to Date object
      .custom((value, { req }) => {
        if (value < new Date()) {
          throw new Error("Due date cannot be in the past.");
        }
        return true;
      }),
  ],
  subCon.postAddAssignment
);

/**
 * @swagger
 * /courses/{courseId}/subjects/{subjectId}/projects:
 *   post:
 *     summary: Add a new project
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Adds a new project to a specific subject within a course. Requires administrator privileges.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course.
 *       - in: path
 *         name: subjectId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the subject.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the project.
 *               description:
 *                 type: string
 *                 description: Description of the project.
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Due date of the project (YYYY-MM-DD).
 *               totalPoints:
 *                 type: number
 *                 description: Total points for the project.
 *             required:
 *               - title
 *               - description
 *               - dueDate
 *               - totalPoints
 *     responses:
 *       200:
 *         description: Project added successfully. Redirects to the projects list.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       422:
 *         description: Validation failed.
 *       500:
 *         description: Server error.
 */
router.post(
  "/courses/:courseId/subjects/:subjectId/projects",
  isAdmin,
  [
    body(
      "title",
      "Project title is required and must be at least 3 characters."
    )
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("description", "Description is required.").isLength({ min: 5 }).trim(),
    body("dueDate", "Please enter a valid due date.")
      .isISO8601() // Checks for YYYY-MM-DD format
      .toDate() // Converts valid string to Date object
      .custom((value, { req }) => {
        if (value < new Date()) {
          throw new Error("Due date cannot be in the past.");
        }
        return true;
      }),
  ],
  subCon.postAddProject
);

/**
 * @swagger
 * /courses/{courseId}/manage-students:
 *   get:
 *     summary: Get student management page for a course
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Renders the page to manage students for a specific course, including enrolled students, their progress, and options to add/remove students. Requires administrator privileges.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course to manage students for.
 *     responses:
 *       200:
 *         description: Successfully rendered the student management page.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       404:
 *         description: Course not found.
 *       500:
 *         description: Server error.
 */
router.get(
  "/courses/:courseId/manage-students",
  isAdmin,
  subCon.getManageCourseStudents
);

/**
 * @swagger
 * /courses/{courseId}/students/{studentId}/update-scores:
 *   post:
 *     summary: Update student scores for a course
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Updates assignment and project scores for a specific student in a course. Requires administrator privileges.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course.
 *       - in: path
 *         name: studentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the student whose scores are being updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             patternProperties:
 *               "^scores\\[[a-f0-9]+\\]\\[(assignment|project)\\]\\[[a-f0-9]+\\]$":
 *                 type: string
 *                 description: Dynamic fields for scores, e.g., scores[subjectId][assignment][assignmentId]=grade.
 *     responses:
 *       200:
 *         description: Scores updated successfully. Redirects to the manage students page.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       404:
 *         description: Student not found.
 *       500:
 *         description: Failed to update scores or server error.
 */
router.post(
  "/courses/:courseId/students/:studentId/update-scores",
  isAdmin,
  subCon.postUpdateStudentScores // New controller function
);

/**
 * @swagger
 * /courses/{courseId}/add-student:
 *   post:
 *     summary: Add a student to a course
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Enrolls an existing user into a specified course. Requires administrator privileges.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course to add the student to.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               userIdToAdd:
 *                 type: string
 *                 description: ID of the user to enroll in the course.
 *             required:
 *               - userIdToAdd
 *     responses:
 *       200:
 *         description: Student successfully added to the course. Redirects to the manage students page.
 *       400:
 *         description: Validation failed (e.g., invalid user ID).
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       404:
 *         description: User or Course not found.
 *       409:
 *         description: User is already enrolled in this course.
 *       500:
 *         description: Failed to add student or server error.
 */
router.post(
  "/courses/:courseId/add-student",
  isAdmin,
  [
    // Add validation for the selected user ID
    body("userIdToAdd", "Please select a user to add.").isMongoId(), // Check if it's a valid MongoDB ObjectId format
  ],
  subCon.postAddStudentToCourse // New controller function
);

/**
 * @swagger
 * /courses/{courseId}/remove-student:
 *   post:
 *     summary: Remove a student from a course
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Removes an enrolled student from a specified course. Requires administrator privileges.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course to remove the student from.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               userIdToRemove:
 *                 type: string
 *                 description: ID of the user to remove from the course.
 *             required:
 *               - userIdToRemove
 *     responses:
 *       200:
 *         description: Student successfully removed from the course. Redirects to the manage students page.
 *       400:
 *         description: Validation failed (e.g., invalid user ID).
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       404:
 *         description: User or Course not found.
 *       409:
 *         description: User is not enrolled in this course.
 *       500:
 *         description: Failed to remove student or server error.
 */
router.post(
  "/courses/:courseId/remove-student",
  isAdmin,
  [
    // Add validation for the selected user ID
    body("userIdToRemove", "Please select a student to remove.").isMongoId(), // Check if it's a valid MongoDB ObjectId format
  ],
  subCon.postRemoveStudentFromCourse // New controller function
);

/**
 * @swagger
 * /admin/courses/{courseId}/edit:
 *   get:
 *     summary: Get course edit form
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Renders the form to edit an existing course, pre-populated with its current data. Requires administrator privileges.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course to edit.
 *     responses:
 *       200:
 *         description: Successfully rendered the course edit form.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       404:
 *         description: Course not found.
 *       500:
 *         description: Server error.
 */
router.get("/admin/courses/:courseId/edit", isAdmin, subCon.getEditCourse);

/**
 * @swagger
 * /admin/courses/{courseId}/edit:
 *   post:
 *     summary: Update an existing course
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Updates the details of an existing course, including optional image upload. Requires administrator privileges.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course to update.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Updated title of the course.
 *               description:
 *                 type: string
 *                 description: Updated description of the course.
 *               date:
 *                 type: string
 *                 description: Updated date of the course (e.g., "Jan 1 - Mar 30").
 *               price:
 *                 type: number
 *                 format: float
 *                 description: Updated price of the course.
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New image file for the course (optional).
 *             required:
 *               - title
 *               - description
 *               - date
 *               - price
 *     responses:
 *       200:
 *         description: Course updated successfully. Redirects to the admin dashboard.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       403:
 *         description: Forbidden, user is not an administrator.
 *       404:
 *         description: Course not found.
 *       422:
 *         description: Validation failed.
 *       500:
 *         description: Failed to update course or server error.
 */
router.post(
  "/admin/courses/:courseId/edit",
  isAdmin,
  [
    body("title", "Course title is required and must be at least 3 characters.")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body(
      "description",
      "Description is required and must be at least 5 characters."
    )
      .isLength({ min: 5 })
      .trim(),
    body("date", "Please enter a valid date for the course.")
      .isString() // Assuming date is a string like "Jan 1 - Mar 30"
      .isLength({ min: 3 })
      .trim(),
    body("price", "Price must be a valid number and non-negative.").isFloat({
      min: 0,
    }),
    // No direct validation for 'image' file here, multer handles it.
    // If no image is provided, the existing one will be kept.
  ],
  subCon.postEditCourse
);

/**
 * @swagger
 * /courses/{courseId}:
 *   get:
 *     summary: Get single course details
 *     tags: [Public]
 *     security:
 *       - bearerAuth: []
 *     description: Renders the detail page for a single course. Requires user authentication to check purchase status.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course to retrieve.
 *     responses:
 *       200:
 *         description: Successfully rendered the course detail page.
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       404:
 *         description: Course not found.
 *       500:
 *         description: Server error.
 */
router.get("/:courseId", isAuth, controller.getCourse);

module.exports = router;
