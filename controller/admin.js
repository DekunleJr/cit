const Course = require("../models/course");
const Subject = require("../models/subject");
const { validationResult } = require("express-validator");

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

    console.log(
      `Subject '${savedSubject.title}' added to course '${course.title}'`
    );

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

// exports.getAssignments = async (req, res, next) => {
//   const { courseId, subjectId } = req.params;
//   try {
//     const subject = await Subject.findOne({
//       _id: subjectId,
//       course: courseId,
//     }).populate("course", "title"); // Populate course title for context

//     if (!subject) {
//       return throwError(
//         "Subject not found or does not belong to this course.",
//         404
//       );
//     }
//     console.log("got here");

//     res.render("admin/assignments-list", {
//       pageTitle: `${subject.code} - Assignments`,
//       path: `/courses/${courseId}/subjects/${subjectId}/assignments`,
//       subject: subject,
//       course: subject.course, // Pass the populated course object
//       user: req.session.user, // Pass user for potential role checks in view
//       isAuthenticated: req.session.isLoggedIn,
//       userRole: req.session.user?.type, // Pass user role safely
//     });
//   } catch (err) {
//     if (!err.statusCode) {
//       err.statusCode = 500;
//     }
//     console.log(err);
//     next(err); // Pass error to central error handler
//   }
// };

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

    res.render("admin/add-assignment-form", {
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
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postAddAssignment = async (req, res, next) => {
  const { courseId, subjectId } = req.params;
  const { title, description, dueDate } = req.body;
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
        oldInput: { title, description, dueDate }, // Pass back user's input
        csrfToken: req.csrfToken(),
      });
    }

    // Create the new assignment object (Mongoose subdocuments automatically get an _id)
    const newAssignment = {
      title: title,
      description: description,
      dueDate: new Date(dueDate), // Ensure it's a Date object
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
    next(err);
  }
};
