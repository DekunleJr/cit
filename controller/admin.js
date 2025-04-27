const Course = require("../models/course");
const Subject = require("../models/subject");
const { validationResult } = require("express-validator");
const User = require("../models/user");

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
    console.log("Subject found:"); // Debugging line
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
      totalPoints: 0, // Initialize totalPoints to 0 or any default value
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

    // Create the new project object (Mongoose subdocuments automatically get an _id)
    const newProject = {
      title: title,
      description: description,
      dueDate: new Date(dueDate), // Ensure it's a Date object
      totalPoints: 0,
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
      // New view: views/admin/manage-students.ejs
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
  const scores = req.body.scores; // Expected format: scores[subjectId][assignment/project][itemId] = grade

  try {
    const student = await User.findById(studentId);
    if (!student) {
      req.flash("error", "Student not found.");
      return res.redirect(`/courses/${courseId}/manage-students`);
    }

    let changesMade = false;

    // Iterate through the submitted scores
    for (const subjectId in scores) {
      // Find the corresponding progress entry for this subject in the student's record
      const progressEntry = student.subjectProgress?.find(
        (p) => String(p.subject) === subjectId
      );
      if (!progressEntry) continue; // Skip if student has no progress for this subject

      // Update Assignments
      if (scores[subjectId]?.assignment) {
        for (const assignmentId in scores[subjectId].assignment) {
          const grade = scores[subjectId].assignment[assignmentId];
          const assignmentProgress = progressEntry.assignments?.find(
            (a) => String(a.assignmentId) === assignmentId
          );

          // Validate grade (basic - is number?) - add more robust validation if needed
          const gradeNum = parseFloat(grade);
          if (grade.trim() === "" || isNaN(gradeNum)) {
            // Allow empty input to clear grade? Or require number? Let's allow clearing for now.
            if (assignmentProgress) {
              assignmentProgress.grade = undefined; // Clear grade
              assignmentProgress.status = "Pending"; // Reset status
              changesMade = true;
            }
            continue; // Skip to next item if input is empty or not a number
          }

          if (assignmentProgress) {
            // Check if grade actually changed to avoid unnecessary saves/updates
            if (
              assignmentProgress.grade !== gradeNum ||
              assignmentProgress.status !== "Graded"
            ) {
              assignmentProgress.grade = gradeNum;
              assignmentProgress.status = "Graded"; // Mark as graded
              changesMade = true;
            }
          } else {
            // Assignment progress doesn't exist, create it (should ideally exist from enrollment)
            progressEntry.assignments.push({
              assignmentId: assignmentId, // Relies on assignmentId being a valid ObjectId string
              grade: gradeNum,
              status: "Graded",
              submittedDate: new Date(), // Mark grading date?
            });
            changesMade = true;
            console.warn(
              `Created missing assignment progress for student ${studentId}, subject ${subjectId}, assignment ${assignmentId}`
            );
          }
        }
      }

      // Update Projects (similar logic)
      if (scores[subjectId]?.project) {
        for (const projectId in scores[subjectId].project) {
          const grade = scores[subjectId].project[projectId];
          const projectProgress = progressEntry.projects?.find(
            (p) => String(p.projectId) === projectId
          );

          const gradeNum = parseFloat(grade);
          if (grade.trim() === "" || isNaN(gradeNum)) {
            if (projectProgress) {
              projectProgress.grade = undefined;
              projectProgress.status = "Pending";
              changesMade = true;
            }
            continue;
          }

          if (projectProgress) {
            if (
              projectProgress.grade !== gradeNum ||
              projectProgress.status !== "Graded"
            ) {
              projectProgress.grade = gradeNum;
              projectProgress.status = "Graded";
              changesMade = true;
            }
          } else {
            progressEntry.projects.push({
              projectId: projectId,
              grade: gradeNum,
              status: "Graded",
              submittedDate: new Date(),
            });
            changesMade = true;
            console.warn(
              `Created missing project progress for student ${studentId}, subject ${subjectId}, project ${projectId}`
            );
          }
        }
      }
    } // End loop through subjects in scores

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
    res.redirect(`/courses/${courseId}/manage-students`);
    // Consider passing error to next(err) for more detailed logging/handling
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
