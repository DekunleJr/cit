const express = require("express");
const router = express.Router();
const isAdmin = require("../util/isAdmin");
const isAuth = require("../controller/isAuth");
const controller = require("../controller/home");
const subCon = require("../controller/admin");
const { check, body } = require("express-validator");

router.get("/", controller.getindex);

router.get("/about", controller.getAbout);

router.get("/contact", controller.getContact);

router.get("/courses", controller.getCourses);

router.get("/services", controller.getServices);

router.get("/events", controller.getEvent);

router.get("/news", controller.getNews);

router.get("/teachers", controller.getTeacher);

router.get("/myCourses", isAuth, controller.getMyCourses);

router.get("/admin", isAdmin, controller.getAdmin);

router.post("/admin/teacher", controller.postTeachers);

router.post("/admin/event", controller.postEvent);

router.post("/admin/news", controller.postNews);

router.post("/admin/course", controller.postCourse);

router.post("/admin/service", controller.postService);

router.post("/admin/alumni", controller.postAlumni);

router.post("/send_mail", controller.postEmail);

router.post("/delete-news", isAdmin, controller.postDeleteNews);

router.post("/delete-event", isAdmin, controller.postDeleteEvent);

router.post("/delete-teacher", isAdmin, controller.postDeleteTeacher);

router.post("/delete-course", isAdmin, controller.postDeleteCourse);

router.post("/delete-service", isAdmin, controller.postDeleteService);

router.post("/delete-alumni", isAdmin, controller.postDeleteAlumni);

router.post("/initialize-payment", controller.postPayment);

router.get("/payment/callback", controller.getPayment);

router.get(
  "/admin/courses/:courseId/add-subject",
  isAdmin,
  subCon.getAddSubject
);

router.post("/admin/add-subject", isAdmin, subCon.postAddSubject);

router.get(
  "/courses/:courseId/subjects/:subjectId/assignments",
  isAuth, // Anyone logged in can view
  subCon.getAssignments
);

router.get(
  "/courses/:courseId/subjects/:subjectId/projects",
  isAuth, // Anyone logged in can view
  subCon.getProjects
);

router.get(
  "/courses/:courseId/subjects/:subjectId/assignments/new",
  isAdmin,
  subCon.getAddAssignment
);

// POST new assignment data (Admin Only)
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

router.get(
  "/courses/:courseId/manage-students",
  isAdmin,
  subCon.getManageCourseStudents
);

router.post(
  "/courses/:courseId/students/:studentId/update-scores",
  isAdmin,
  subCon.postUpdateStudentScores // New controller function
);

router.post(
  "/courses/:courseId/add-student",
  isAdmin,
  [
    // Add validation for the selected user ID
    body("userIdToAdd", "Please select a user to add.").isMongoId(), // Check if it's a valid MongoDB ObjectId format
  ],
  subCon.postAddStudentToCourse // New controller function
);

router.post(
  "/courses/:courseId/remove-student",
  isAdmin,
  [
    // Add validation for the selected user ID
    body("userIdToRemove", "Please select a student to remove.").isMongoId(), // Check if it's a valid MongoDB ObjectId format
  ],
  subCon.postRemoveStudentFromCourse // New controller function
);

// Routes for editing courses
router.get("/admin/courses/:courseId/edit", isAdmin, subCon.getEditCourse);
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

router.get("/:courseId", isAuth, controller.getCourse);

module.exports = router;
