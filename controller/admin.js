const Course = require("../models/course");
const Subject = require("../models/subject");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const mongoose = require("mongoose");
const path = require("path");
const fileHelper = require("../util/file"); // Make sure to require fileHelper

exports.getAddSubject = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);

    if (!course) {
      // Handle course not found error (e.g., render an error page or redirect)
      const error = new Error("Course not found.");
      error.statusCode = 404;
      return next(error); // Pass error to error handling middlewar
    }

    // Render the EJS view, passing the course object (or at least its ID)
    res.render("admin/add-subject-form", {
      // Path to your EJS file
      pageTitle: `Add Subject to ${course.title}`,
      path: "/admin/add-subject", // For navigation highlighting, etc.
      course: course, // Pass the whole course object
      errorMessage: null, // Or retrieve from flash messages
      // Add other necessary template variables (e.g., csrfToken if using csurf)
    });
  } catch (err) {
    console.error("Error fetching course for add subject form:", err);
    console.log(err);
    const error = new Error("Failed to load add subject form.");
    error.statusCode = 500;
    next(error);
  }
};

// --- Controller for Editing a Course ---
exports.getEditCourse = async (req, res, next) => {
  const courseId = req.params.courseId;
  try {
    const course = await Course.findById(courseId);

    if (!course) {
      req.flash("error", "Course not found.");
      return res.redirect("/admin"); // Redirect to admin dashboard or course list
    }

    res.render("admin/edit-course-form", {
      pageTitle: `Edit Course: ${course.title}`,
      path: `/admin/courses/${courseId}/edit`,
      course: course,
      editing: true, // Indicate that we are in edit mode
      hasError: false,
      errorMessage: null,
      validationErrors: [],
      oldInput: {
        title: course.title,
        description: course.description,
        date: course.date,
        price: course.price,
        imgUrl: course.imgUrl,
      },
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    console.error("Error fetching course for edit form:", err);
    const error = new Error("Failed to load course edit form.");
    error.statusCode = 500;
    next(error);
  }
};

exports.postEditCourse = async (req, res, next) => {
  const courseId = req.params.courseId;
  const { title, description, date, price } = req.body;
  const image = req.file; // Get the uploaded file
  const errors = validationResult(req);

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      req.flash("error", "Course not found.");
      return res.redirect("/admin");
    }

    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render("admin/edit-course-form", {
        pageTitle: `Edit Course`,
        path: `/admin/courses/${courseId}/edit`,
        course: { _id: courseId }, // Pass ID for form action
        editing: true,
        hasError: true,
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
        oldInput: {
          title,
          description,
          date,
          price,
          imgUrl: course.imgUrl, // Retain old image URL for re-render
        },
        csrfToken: req.csrfToken(),
      });
    }

    course.title = title;
    course.description = description;
    course.date = date;
    course.price = price;

    if (image) {
      // If a new image is uploaded, delete the old one and save the new path
      if (course.imgUrl) {
        fileHelper.deleteFile(
          path.join(__dirname, "..", "public", course.imgUrl)
        );
      }
      course.imgUrl = "img/" + image.filename;
    }
    // If no new image is uploaded, course.imgUrl remains unchanged

    await course.save();
    req.flash("success", `Course "${course.title}" updated successfully!`);
    res.redirect("/admin"); // Redirect to admin dashboard or course list
  } catch (err) {
    console.error("Error updating course:", err);
    const error = new Error("Failed to update course.");
    error.statusCode = 500;
    next(error);
  }
};

exports.postAddSubject = async (req, res, next) => {
  // Extract data from the request body
  const { title, code, units, courseId } = req.body; // courseId comes from the hidden input
  // const csrfToken = req.body._csrf; // If using CSRF

  try {
    // 1. Verify the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      // Handle case where the course ID submitted is invalid
      const error = new Error("Target course not found.");
      error.statusCode = 404;
      // Potentially redirect back to form with error using flash
      // req.flash('error', 'Target course not found.');
      // return res.redirect(`/admin/courses/${courseId}/add-subject`); // Redirect back to form
      return next(error); // Or pass to error handler
    }

    // 2. Create the new Subject document
    const newSubject = new Subject({
      title: title,
      code: code,
      units: parseInt(units, 10), // Ensure units is a number
      course: courseId, // Set the reference to the course
      // Initialize assignments/projects as empty arrays if needed by schema
      assignments: [],
      projects: [],
    });

    // 3. Save the new Subject
    const savedSubject = await newSubject.save();

    // 4. Add the new Subject's ID to the Course's 'subjects' array
    course.subjects.push(savedSubject._id); // Add the ObjectId
    await course.save(); // Save the updated course document

    // 5. Redirect to a relevant page (e.g., the course detail page)
    req.flash("success", "Subject added successfully!");
    res.redirect(`/${courseId}`); // Redirect to the course detail page
  } catch (err) {
    console.error("Error adding subject:", err);
    const error = new Error("Failed to add subject.");
    error.statusCode = 500;
    next(error); // Pass to error handling middleware
  }
};

exports.getAssignments = async (req, res, next) => {
  const { courseId, subjectId } = req.params;
  try {
    const subject = await Subject.findOne({ _id: subjectId, course: courseId })
      .populate("course") // Ensure course has `_id` and `title`
      .populate("assignments"); // Ensure assignments is populated if needed

    if (!subject) {
      req.flash("error", "Subject not found");
      return res.redirect("/courses"); // Redirect to courses if subject not found
    }

    res.render("assignment", {
      pageTitle: `Assignments for ${subject.title}`,
      path: `/courses/${courseId}/subjects/${subjectId}/assignments`,
      subject: subject,
      course: subject.course,
      userRole: req.session.user.type, // Make sure this exists
      flash: req.flash(),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.getProjects = async (req, res, next) => {
  const { courseId, subjectId } = req.params;
  try {
    const subject = await Subject.findOne({ _id: subjectId, course: courseId })
      .populate("course") // Ensure course has `_id` and `title`
      .populate("projects"); // Ensure assignments is populated if needed

    if (!subject) {
      req.flash("error", "Subject not found");
      return res.redirect("/courses"); // Redirect to courses if subject not found
    }

    res.render("project", {
      pageTitle: `Projects for ${subject.title}`,
      path: `/courses/${courseId}/subjects/${subjectId}/projects`,
      subject: subject,
      course: subject.course,
      userRole: req.session.user.type, // Make sure this exists
      flash: req.flash(),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.getAddAssignment = async (req, res, next) => {
  const { courseId, subjectId } = req.params;
  try {
    const subject = await Subject.findOne({
      _id: subjectId,
      course: courseId,
    }).populate("course", "title");

    if (!subject) {
      return req.flash("error", "Subject not found!");
    }

    res.render(
      "admin/add-assignment-form",
      {
        pageTitle: `Add Assignment to ${subject.code}`,
        path: `/courses/${courseId}/subjects/${subjectId}/assignments/new`,
        subject: subject,
        course: subject.course,
        editing: false, // Flag for potential edit functionality later
        hasError: false,
        errorMessage: null,
        validationErrors: [],
        oldInput: { title: "", description: "", dueDate: "" }, // Initialize oldInput
        csrfToken: req.csrfToken(), // Get CSRF token
      },
      (err, html) => {
        if (err) {
          console.error("EJS Render Error:", err);
          return next(err); // Or res.status(500).send('Rendering error')
        }
        res.send(html);
      }
    );
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    console.log("Error fetching subject for add assignment form:", err);
    next(new Error(err));
  }
};

exports.postAddAssignment = async (req, res, next) => {
  const { courseId, subjectId } = req.params;
  const { title, description, dueDate, totalPoints } = req.body;
  const errors = validationResult(req);

  let subject; // Declare subject here to access it in catch block if needed

  try {
    subject = await Subject.findOne({
      _id: subjectId,
      course: courseId,
    }).populate("course", "title"); // Need course title if re-rendering form
    if (!subject) {
      return req.flash("error", "Subject not found!");
    }

    if (!errors.isEmpty()) {
      console.log(errors.array());
      // Re-render the form with errors and old input
      return res.status(422).render("subject/add-assignment-form", {
        pageTitle: `Add Assignment to ${subject.code}`,
        path: `/courses/${courseId}/subjects/${subjectId}/assignments/new`,
        subject: subject,
        course: subject.course,
        editing: false,
        hasError: true,
        errorMessage: errors.array()[0].msg, // Show the first error message
        validationErrors: errors.array(),
        oldInput: { title, description, dueDate, totalPoints }, // Pass back user's input
        csrfToken: req.csrfToken(),
      });
    }
    // Create the new assignment object (Mongoose subdocuments automatically get an _id)
    const newAssignment = {
      title: title,
      description: description,
      dueDate: new Date(dueDate), // Ensure it's a Date object
      totalPoints: totalPoints, // Initialize totalPoints to 0 or any default value
    };
    // Add to the assignments array
    subject.assignments.push(newAssignment);
    // Save the parent Subject document
    await subject.save();
    req.flash("success", "Assignment added successfully!"); // Add success message
    res.redirect(`/courses/${courseId}/subjects/${subjectId}/assignments`); // Redirect to the list
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    console.log("Error adding assignment:", err);
    next(err);
  }
};

exports.postAddProject = async (req, res, next) => {
  const { courseId, subjectId } = req.params;
  const { title, description, dueDate, totalPoints } = req.body;
  const errors = validationResult(req);

  let subject; // Declare subject here to access it in catch block if needed

  try {
    subject = await Subject.findOne({
      _id: subjectId,
      course: courseId,
    }).populate("course", "title"); // Need course title if re-rendering form

    if (!subject) {
      return req.flash("error", "Subject not found!");
    }

    if (!errors.isEmpty()) {
      console.log(errors.array());
      // Re-render the form with errors and old input
      return res.status(422).render("subject/add-assignment-form", {
        pageTitle: `Add Assignment to ${subject.code}`,
        path: `/courses/${courseId}/subjects/${subjectId}/assignments/new`,
        subject: subject,
        course: subject.course,
        editing: false,
        hasError: true,
        errorMessage: errors.array()[0].msg, // Show the first error message
        validationErrors: errors.array(),
        oldInput: { title, description, dueDate, totalPoints }, // Pass back user's input
        csrfToken: req.csrfToken(),
      });
    }

    // Create the new project object (Mongoose subdocuments automatically get an _id)
    const newProject = {
      title: title,
      description: description,
      dueDate: new Date(dueDate), // Ensure it's a Date object
      totalPoints: totalPoints,
    };

    // Add to the assignments array
    subject.projects.push(newProject);

    // Save the parent Subject document
    await subject.save();

    req.flash("success", "Project added successfully!"); // Add success message
    res.redirect(`/courses/${courseId}/subjects/${subjectId}/projects`); // Redirect to the list
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Helper function (optional)
const mapProgressForView = (userProgressArray = [], courseSubjectMap) => {
  const progressMap = {}; // { subjectId: { assignmentId: progress, ... }, ... }
  userProgressArray.forEach((p) => {
    const subjId = String(p.subject?._id);
    // Only map progress if the subject belongs to the current course
    if (p.subject && courseSubjectMap.has(subjId)) {
      const assignmentProgress = {};
      const projectProgress = {};
      p.assignments?.forEach((a) => {
        assignmentProgress[String(a.assignmentId)] = a;
      });
      p.projects?.forEach((proj) => {
        projectProgress[String(proj.projectId)] = proj;
      });
      progressMap[subjId] = {
        assignments: assignmentProgress,
        projects: projectProgress,
      };
    }
  });
  return progressMap;
};

// --- Controller for Managing Course Students ---
exports.getManageCourseStudents = async (req, res, next) => {
  const courseId = req.params.courseId;
  try {
    // 1. Fetch Course with FULL Subject Definitions (assignments/projects with totalPoints)
    const course = await Course.findById(courseId).populate({
      path: "subjects",
      model: "Subject", // Explicitly specify model
      populate: [
        // Populate assignments and projects within subjects
        { path: "assignments" },
        { path: "projects" },
      ],
    });

    if (!course) {
      req.flash("error", "Course not found.");
      return res.redirect("/admin/dashboard"); // Or some other appropriate page
    }

    // Create a map of subjects in this course for quick lookup
    const courseSubjectMap = new Map(
      course.subjects.map((s) => [String(s._id), s])
    );

    // 2. Fetch Enrolled Students (populate progress for mapping)
    const enrolledStudents = await User.find({ purchasedCourses: courseId })
      .select("firstname lastname email subjectProgress") // Select needed fields + progress
      .populate("subjectProgress.subject", "_id"); // Only need subject ID here for mapping

    // 3. Process enrolled students to structure progress data relative to *this* course
    const processedStudents = enrolledStudents.map((student) => {
      return {
        _id: student._id,
        firstname: student.firstname,
        lastname: student.lastname,
        email: student.email,
        // Create a map of subjectId -> { assignmentId: progress, projectId: progress }
        // containing ONLY progress for subjects in THIS course
        progressMap: mapProgressForView(
          student.subjectProgress,
          courseSubjectMap
        ),
      };
    });

    // 4. Fetch Users NOT Enrolled in this course
    const unenrolledUsers = await User.find({
      purchasedCourses: { $ne: courseId },
    })
      .select("firstname lastname email _id")
      .sort({ lastname: 1, firstname: 1 });

    res.render("admin/manage-students", {
      pageTitle: `Manage Students: ${course.title}`,
      path: `/admin/courses/${courseId}/manage-students`, // For active nav link
      course: course, // Contains full subject definitions needed for iteration
      enrolledStudents: processedStudents, // Contains user info and mapped progress
      unenrolledUsers: unenrolledUsers,
      csrfToken: req.csrfToken(),
      user: req.user, // For header/nav
      errorMessage: req.flash("error"), // Pass flash messages
      successMessage: req.flash("success"),
    });
  } catch (err) {
    console.error("Error getting manage students page:", err);
    const error = new Error("Failed to load student management page.");
    error.httpStatusCode = 500;
    return next(error);
  }
};

// --- Controller for Updating Student Scores ---
exports.postUpdateStudentScores = async (req, res, next) => {
  const { courseId, studentId } = req.params;
  const submittedData = req.body;
  const scoreKeyRegex =
    /^scores\[([a-f0-9]+)\]\[(assignment|project)\]\[([a-f0-9]+)\]$/;

  try {
    const student = await User.findById(studentId).populate(
      "subjectProgress.subject"
    ); // Populate subject if needed for context/validation later
    if (!student) {
      req.flash("error", "Student not found.");
      return res.redirect(`/courses/${courseId}/manage-students`);
    }

    let changesMade = false;

    // Iterate through all keys in the submitted form data
    for (const key in submittedData) {
      const match = key.match(scoreKeyRegex);

      if (match) {
        const [, subjectId, itemType, itemId] = match; // Destructure the captured groups
        const gradeStr = submittedData[key]; // Get the score value (as a string)

        // Find the corresponding progress entry for this subject
        const progressEntry = student.subjectProgress?.find(
          (p) => p.subject?._id?.toString() === subjectId // Safely compare IDs
        );

        if (!progressEntry) {
          console.warn(
            `No progress entry found for student ${studentId}, subject ${subjectId}. Skipping score.`
          );
          continue; // Skip if student has no progress for this subject
        }

        // Validate the grade string - check if empty or not a valid number representation
        const gradeNum = parseFloat(gradeStr);
        const isEmptyInput = gradeStr.trim() === "";
        const isInvalidNumber = isNaN(gradeNum);

        // Handle Assignments
        if (itemType === "assignment") {
          let assignmentProgress = progressEntry.assignments?.find(
            (a) => a.assignmentId?.toString() === itemId
          );

          // Handle empty/invalid input - Clear the grade
          if (isEmptyInput || isInvalidNumber) {
            if (
              assignmentProgress &&
              typeof assignmentProgress.grade !== "undefined"
            ) {
              // Only clear if it had a grade
              assignmentProgress.grade = undefined;
              assignmentProgress.status = "Pending"; // Or whatever default status is
              changesMade = true;
            }
            continue; // Move to the next key
          }

          // Handle valid number input
          if (assignmentProgress) {
            // Update existing progress
            if (
              assignmentProgress.grade !== gradeNum ||
              assignmentProgress.status !== "Graded"
            ) {
              assignmentProgress.grade = gradeNum;
              assignmentProgress.status = "Graded";
              changesMade = true;
            }
          } else {
            // Create new progress entry (use with caution - ensure itemId is valid)
            if (!mongoose.Types.ObjectId.isValid(itemId)) {
              console.error(
                `Invalid assignment ID format: ${itemId}. Skipping.`
              );
              continue;
            }
            progressEntry.assignments.push({
              assignmentId: itemId, // Store as ObjectId if possible, or ensure consistency
              grade: gradeNum,
              status: "Graded",
              submittedDate: new Date(), // Or maybe null?
            });
            changesMade = true;
            console.warn(
              `Created missing assignment progress for ${itemId}, score ${gradeNum}`
            );
          }
        }
        // Handle Projects (similar logic)
        else if (itemType === "project") {
          let projectProgress = progressEntry.projects?.find(
            (p) => p.projectId?.toString() === itemId
          );

          // Handle empty/invalid input - Clear the grade
          if (isEmptyInput || isInvalidNumber) {
            if (
              projectProgress &&
              typeof projectProgress.grade !== "undefined"
            ) {
              projectProgress.grade = undefined;
              projectProgress.status = "Pending";
              changesMade = true;
            }
            continue; // Move to the next key
          }

          // Handle valid number input
          if (projectProgress) {
            // Update existing progress
            if (
              projectProgress.grade !== gradeNum ||
              projectProgress.status !== "Graded"
            ) {
              projectProgress.grade = gradeNum;
              projectProgress.status = "Graded";
              changesMade = true;
            }
          } else {
            // Create new progress entry (use with caution)
            if (!mongoose.Types.ObjectId.isValid(itemId)) {
              console.error(`Invalid project ID format: ${itemId}. Skipping.`);
              continue;
            }
            progressEntry.projects.push({
              projectId: itemId,
              grade: gradeNum,
              status: "Graded",
              submittedDate: new Date(),
            });
            changesMade = true;
            console.warn(
              `Created missing project progress for ${itemId}, score ${gradeNum}`
            );
          }
        }
      } // End if (match)
    } // End loop through submittedData keys

    if (changesMade) {
      await student.save();
      req.flash(
        "success",
        `Scores updated successfully for ${student.firstname} ${student.lastname}.`
      );
    } else {
      req.flash(
        "info",
        `No score changes detected for ${student.firstname} ${student.lastname}.`
      );
    }

    res.redirect(`/courses/${courseId}/manage-students`);
  } catch (err) {
    console.error("Error updating student scores:", err);
    req.flash("error", "Failed to update scores. Please try again.");
    // Determine the redirect target based on where the error occurred if possible
    res.redirect(`/courses/${courseId}/manage-students`);
    // Consider using next(err) for more robust error handling/logging
    // next(err);
  }
};

// --- Controller for Adding a Student to a Course ---
exports.postAddStudentToCourse = async (req, res, next) => {
  const courseId = req.params.courseId;
  const userIdToAdd = req.body.userIdToAdd;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("error", errors.array()[0].msg);
    return res.redirect(`/courses/${courseId}/manage-students`);
  }

  try {
    const user = await User.findById(userIdToAdd);
    const course = await Course.findById(courseId).populate("subjects"); // Need subjects to initialize progress

    if (!user || !course) {
      req.flash("error", "User or Course not found.");
      return res.redirect(`/courses/${courseId}/manage-students`);
    }

    // Check if already enrolled
    if (user.purchasedCourses.includes(courseId)) {
      req.flash(
        "info",
        `${user.firstname} ${user.lastname} is already enrolled in this course.`
      );
      return res.redirect(`/courses/${courseId}/manage-students`);
    }

    // Add course to user's purchased list
    user.purchasedCourses.push(courseId);

    // Initialize subjectProgress for Approach A
    course.subjects.forEach((subject) => {
      // Check if progress for this subject already exists (shouldn't, but safety check)
      const existingProgress = user.subjectProgress.find(
        (p) => String(p.subject) === String(subject._id)
      );
      if (!existingProgress) {
        user.subjectProgress.push({
          subject: subject._id,
          assignments: [], // Initialize with empty arrays
          projects: [],
          attendance: [],
        });
      }
    });

    await user.save();
    req.flash(
      "success",
      `${user.firstname} ${user.lastname} successfully added to the course.`
    );
    res.redirect(`/courses/${courseId}/manage-students`);
  } catch (err) {
    console.error("Error adding student to course:", err);
    req.flash("error", "Failed to add student to the course.");
    res.redirect(`/courses/${courseId}/manage-students`);
    // Consider passing error to next(err)
  }
};

// --- Controller for Removing a Student from a Course ---
exports.postRemoveStudentFromCourse = async (req, res, next) => {
  const courseId = req.params.courseId;
  const userIdToRemove = req.body.userIdToRemove; // Changed from userIdToAdd

  try {
    const user = await User.findById(userIdToRemove);
    const course = await Course.findById(courseId); // No need to populate subjects here

    if (!user || !course) {
      req.flash("error", "User or Course not found.");
      return res.redirect(`/courses/${courseId}/manage-students`);
    }

    // Check if already not enrolled
    if (!user.purchasedCourses.includes(courseId)) {
      req.flash(
        "info",
        `${user.firstname} ${user.lastname} is not enrolled in this course.`
      );
      return res.redirect(`/courses/${courseId}/manage-students`);
    }

    // Remove course from user's purchased list
    user.purchasedCourses = user.purchasedCourses.filter(
      (cId) => cId.toString() !== courseId.toString()
    );

    // Remove subjectProgress entries related to this course
    user.subjectProgress = user.subjectProgress.filter((progress) => {
      // Keep progress entries where the subject's course is NOT the one being removed
      // This assumes subjectProgress.subject is populated or is an ObjectId
      return progress.subject?.course?.toString() !== courseId.toString();
    });

    await user.save();
    req.flash(
      "success",
      `${user.firstname} ${user.lastname} successfully removed from the course.`
    );
    res.redirect(`/courses/${courseId}/manage-students`);
  } catch (err) {
    console.error("Error removing student from course:", err);
    req.flash("error", "Failed to remove student from the course.");
    res.redirect(`/courses/${courseId}/manage-students`);
    // Consider passing error to next(err)
  }
};
