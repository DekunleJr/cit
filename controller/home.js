const path = require("path");
require("dotenv").config();
const Teacher = require("../models/teachers");
const Event = require("../models/event");
const News = require("../models/news");
const Course = require("../models/course");
const Subject = require("../models/subject");
const Service = require("../models/service");
const Alumni = require("../models/alumni");
const { formatDate } = require("../util/date");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const fileHelper = require("../util/file");
const User = require("../models/user");
const axios = require("axios");
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

exports.getindex = async (req, res, next) => {
  try {
    const event = await Event.find();
    const service = await Service.find();
    const course = await Course.find();
    const teachers = await Teacher.find();
    const news = await News.find();
    const alumni = await Alumni.find();
    res.render("index", {
      service: service,
      news: news,
      alumni: alumni,
      course: course,
      events: event,
      teachers: teachers,
      path: "/",
      pageTitle: "Home page",
    });
  } catch (err) {
    next(new Error(err));
  }
};

exports.getAbout = async (req, res, next) => {
  try {
    res.render("about", {
      path: "/about",
      pageTitle: "About",
    });
  } catch (err) {
    next(new Error(err));
  }
};

exports.getContact = async (req, res, next) => {
  try {
    res.render("contact", {
      path: "/contact",
      pageTitle: "Contact",
    });
  } catch (err) {
    next(new Error(err));
  }
};

exports.getCourses = async (req, res, next) => {
  try {
    const course = await Course.find();
    const teachers = await Teacher.find();
    res.render("courses", {
      teachers: teachers,
      course: course,
      path: "/courses",
      pageTitle: "Courses",
    });
  } catch (err) {
    next(new Error(err));
  }
};

exports.getServices = async (req, res, next) => {
  try {
    const service = await Service.find();
    const teachers = await Teacher.find();
    res.render("services", {
      teachers: teachers,
      service: service,
      path: "/services",
      pageTitle: "Services",
    });
  } catch (err) {
    next(new Error(err));
  }
};

exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.find();
    res.render("events", {
      events: event,
      path: "/events",
      pageTitle: "Events",
    });
  } catch (err) {
    next(new Error(err));
  }
};

exports.getNews = async (req, res, next) => {
  try {
    const news = await News.find();
    res.render("news", {
      news: news,
      path: "/news",
      pageTitle: "News",
    });
  } catch (err) {
    next(new Error(err));
  }
};

exports.getTeacher = async (req, res, next) => {
  try {
    const teachers = await Teacher.find();
    res.render("teachers", {
      teachers: teachers,
      path: "/teachers",
      pageTitle: "Teachers",
    });
  } catch (err) {
    next(new Error(err));
  }
};

// exports.getMyCourses = async (req, res, next) => {
//   try {
//     const userId = req.session.user._id;

//     const user = await User.findById(userId).populate({
//       path: "purchasedCourses",
//       populate: {
//         path: "subjects",
//       },
//     });

//     if (!user) {
//       return res.status(404).render("error", {
//         pageTitle: "Error",
//         message: "User not found",
//       });
//     }

//     // Get the purchased courses (populated from the User model)
//     const myCourses = user.purchasedCourses;

//     // Render the "My Courses" page
//     res.render("myCourse", {
//       pageTitle: "My Courses",
//       path: "/myCourses",
//       course: myCourses,
//       user: user,
//     });
//   } catch (error) {
//     console.error("Error fetching user courses:", error);
//     if (!error.statusCode) {
//       error.statusCode = 500;
//     }
//     next(new Error(error));
//   }
// };

exports.getMyCourses = async (req, res, next) => {
  try {
    const userId = req.session.user._id; // Or req.user._id if populated by middleware

    // 1. Fetch User with Populated Data
    // Need courses, their basic subjects, AND the user's progress details
    const user = await User.findById(userId)
      .populate({
        path: "purchasedCourses", // Populate courses
        select: "title _id description subjects", // Select fields needed for the course itself
        populate: {
          path: "subjects", // Populate basic subject info within each course
          select: "title code units _id", // Fields needed for basic display
        },
      })
      // IMPORTANT: Populate subjectProgress and the subject linked within it
      .populate({
        path: "subjectProgress.subject",
        select: "title code _id", // Basic info for matching
      })
      .lean(); // Use .lean() for performance and easier object manipulation

    if (!user) {
      // If using .lean(), user will be null, not an object with no properties
      return res.status(404).render("error", {
        // Or redirect, or throw error
        pageTitle: "Error",
        message: "User not found",
      });
    }

    // --- Calculation Logic ---
    let subjectDataMap = {}; // Store calculated { subjectId: { enrichedData } }

    if (user.subjectProgress && user.subjectProgress.length > 0) {
      // 2. Get IDs of subjects user has progress for
      const subjectIdsWithProgress = user.subjectProgress
        .map((p) => p.subject?._id) // Get subject ObjectId from progress
        .filter((id) => id) // Filter out any null/undefined refs
        .map((id) => id.toString()); // Convert to strings for consistent map keys

      if (subjectIdsWithProgress.length > 0) {
        // 3. Fetch full definitions for these subjects
        const subjectDefinitions = await Subject.find({
          _id: { $in: subjectIdsWithProgress },
        })
          // Ensure totalPoints is selected within assignments/projects
          .select("_id assignments projects title code units")
          .lean(); // Use lean here too

        const subjectDefinitionsMap = new Map(
          subjectDefinitions.map((s) => [s._id.toString(), s])
        );
        const userProgressMap = new Map(
          user.subjectProgress.map((p) => [p.subject?._id?.toString(), p])
        );

        // 4. Calculate average and prepare detailed progress for each subject
        for (const subjectIdStr of subjectDefinitionsMap.keys()) {
          const definition = subjectDefinitionsMap.get(subjectIdStr);
          const progress = userProgressMap.get(subjectIdStr);

          if (!definition || !progress) continue;

          let totalScore = 0;
          let totalPossible = 0;
          let gradedItemsCount = 0;

          const assignmentPointsMap = new Map(
            definition.assignments.map((a) => [a._id.toString(), a.totalPoints])
          );
          const projectPointsMap = new Map(
            definition.projects.map((p) => [p._id.toString(), p.totalPoints])
          );

          // Detailed Assignment Progress Calculation
          const detailedAssignmentProgress =
            progress.assignments?.map((ua) => {
              const assignmentIdStr = ua.assignmentId?.toString();
              const def = definition.assignments.find(
                (a) => a._id.toString() === assignmentIdStr
              );
              const pointsPossible = assignmentPointsMap.get(assignmentIdStr);
              if (
                ua.status === "Graded" &&
                typeof ua.grade === "number" &&
                typeof pointsPossible === "number"
              ) {
                totalScore += ua.grade;
                totalPossible += pointsPossible;
                gradedItemsCount++;
              }
              return {
                _id: ua.assignmentId,
                title: def?.title || "Assignment Missing",
                status: ua.status,
                grade: ua.grade,
                totalPoints: pointsPossible,
              };
            }) || [];

          // Detailed Project Progress Calculation
          const detailedProjectProgress =
            progress.projects?.map((up) => {
              const projectIdStr = up.projectId?.toString();
              const def = definition.projects.find(
                (p) => p._id.toString() === projectIdStr
              );
              const pointsPossible = projectPointsMap.get(projectIdStr);
              if (
                up.status === "Graded" &&
                typeof up.grade === "number" &&
                typeof pointsPossible === "number"
              ) {
                totalScore += up.grade;
                totalPossible += pointsPossible;
                gradedItemsCount++;
              }
              return {
                _id: up.projectId,
                title: def?.title || "Project Missing",
                status: up.status,
                grade: up.grade,
                totalPoints: pointsPossible,
              };
            }) || [];

          // Calculate Average
          let averageScore = null;
          if (totalPossible > 0) {
            averageScore = (totalScore / totalPossible) * 100;
          }

          // Store combined data
          subjectDataMap[subjectIdStr] = {
            _id: definition._id,
            title: definition.title,
            code: definition.code,
            units: definition.units,
            averageScore,
            gradedItemsCount,
            detailedAssignmentProgress,
            detailedProjectProgress,
          };
        }
      }
    }

    // 5. Inject calculated data back into the user's course structure
    // Since we used .lean(), user is a plain object, we can modify it
    if (user.purchasedCourses && Array.isArray(user.purchasedCourses)) {
      user.purchasedCourses.forEach((course) => {
        if (course.subjects && Array.isArray(course.subjects)) {
          course.subjects = course.subjects
            .map((subject) => subjectDataMap[subject._id.toString()]) // Replace basic subject with enriched data
            .filter((subject) => subject !== undefined); // Remove subjects if no enriched data was found (optional)
        }
      });
    }

    // 6. Render the view
    res.render("myCourse", {
      pageTitle: "My Courses",
      path: "/myCourses",
      course: user.purchasedCourses,
      user: user,
    });
  } catch (error) {
    console.error("Error fetching user courses (Approach A):", error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getAdmin = async (req, res, next) => {
  try {
    res.render("admin", {
      path: "/admin",
      pageTitle: "Admin page",
    });
  } catch (err) {
    next(new Error(err));
  }
};

exports.postTeachers = async (req, res, next) => {
  const { name, profession, position, portUrl } = req.body;
  const image = req.file;
  if (!image) {
    return res.status(400).render("admin", {
      path: "/admin",
      pageTitle: "Admin page",
    });
  }

  const imgUrl = "img/" + req.file.filename;

  try {
    const teacher = new Teacher({
      name,
      profession,
      position,
      imgUrl,
      portUrl,
    });

    await teacher.save();
    res.redirect("/teachers");
  } catch (err) {
    next(new Error(err));
  }
};

exports.postEvent = async (req, res, next) => {
  const { title, description, date, location, button } = req.body;
  const image = req.file;
  if (!image) {
    return res.status(400).render("admin", {
      path: "/admin",
      pageTitle: "Admin page",
    });
  }

  const imgUrl = "img/" + req.file.filename;

  try {
    const event = new Event({
      title,
      description,
      date,
      location,
      imgUrl,
      button,
    });

    await event.save();
    res.redirect("/events");
  } catch (err) {
    next(new Error(err));
  }
};

exports.postNews = async (req, res, next) => {
  const { title, description, date, position } = req.body;
  const image = req.file;
  if (!image) {
    return res.status(400).render("admin", {
      path: "/admin",
      pageTitle: "Admin page",
    });
  }

  const imgUrl = "img/" + req.file.filename;

  try {
    const news = new News({
      title,
      description,
      date,
      position,
      imgUrl,
    });

    await news.save();
    res.redirect("/news");
  } catch (err) {
    console.log(err);
  }
};

exports.postCourse = async (req, res, next) => {
  let { title, description, date, price } = req.body;
  const image = req.file;
  if (!image) {
    return res.status(400).render("admin", {
      path: "/admin",
      pageTitle: "Admin page",
    });
  }

  const imgUrl = "img/" + req.file.filename;

  date = formatDate(date);

  try {
    const course = new Course({
      title,
      description,
      date,
      price,
      imgUrl,
    });

    await course.save();
    res.redirect("/courses");
  } catch (err) {
    next(new Error(err));
  }
};

exports.postService = async (req, res, next) => {
  let { title, description } = req.body;
  const image = req.file;
  if (!image) {
    return res.status(400).render("admin", {
      path: "/admin",
      pageTitle: "Admin page",
    });
  }

  const imgUrl = "img/" + req.file.filename;

  try {
    const service = new Service({
      title,
      description,
      imgUrl,
    });

    await service.save();
    res.redirect("/services");
  } catch (err) {
    console.log(err);
  }
};

exports.postAlumni = async (req, res, next) => {
  let { name, comment } = req.body;
  const image = req.file;
  if (!image) {
    return res.status(400).render("admin", {
      path: "/admin",
      pageTitle: "Admin page",
    });
  }

  const imgUrl = "img/" + req.file.filename;

  try {
    const alumni = new Alumni({
      name,
      comment,
      imgUrl,
    });

    await alumni.save();
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
};

exports.postEmail = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER_2,
        pass: process.env.EMAIL_PASS_2,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER_2,
      to: process.env.EMAIL_USER,
      subject: `New message from ${name} about ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    };
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send("Failed to send message");
      }
      res.redirect("/");
    });
  } catch (err) {
    next(new Error(eer));
  }
};

exports.getCourse = async (req, res, next) => {
  try {
    const prodId = req.params.courseId;
    if (!mongoose.Types.ObjectId.isValid(prodId)) {
      return next();
    }
    const courses = await Course.find();
    const course = await Course.findById(prodId).populate("subjects");
    let pay;
    const purchasedCourses = req.session.user.purchasedCourses;

    const isPurchased = purchasedCourses.some((id) => id.equals(course._id));
    if (isPurchased) {
      pay = true;
    } else {
      pay = false;
    }
    if (!course) {
      return res.status(404).render("error", {
        path: "/404",
        pageTitle: "Course Not Found",
        isAuthenticated: req.session.isLoggedIn,
      });
    }
    res.render("course-single", {
      courses: courses,
      course: course,
      user: req.session.user,
      pay: pay,
      pageTitle: course.title,
      path: "/courses",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postDeleteNews = async (req, res, next) => {
  const newsId = req.body.newsId;

  try {
    const news = await News.findById(newsId);
    if (!news) {
      req.flash("error", "News not found");
      return next(new Error("News not found."));
    }
    const filePath = path.join(__dirname, "..", "public", news.imgUrl);
    fileHelper.deleteFile(filePath);
    await News.findByIdAndDelete(newsId);
    res.redirect("/news");
  } catch (err) {
    // next(new Error(err));
    console.log(err);
  }
};

exports.postDeleteEvent = async (req, res, next) => {
  const eventId = req.body.eventId;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      req.flash("error", "event not found");
      return next(new Error("event not found."));
    }
    const filePath = path.join(__dirname, "..", "public", event.imgUrl);

    fileHelper.deleteFile(filePath);
    await Event.findByIdAndDelete(eventId);
    res.redirect("/events");
  } catch (err) {
    // next(new Error(err));
    console.log(err);
  }
};

exports.postDeleteTeacher = async (req, res, next) => {
  const teacherId = req.body.teacherId;

  try {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      req.flash("error", "instructor not found");
      return next(new Error("instructor not found."));
    }
    const filePath = path.join(__dirname, "..", "public", teacher.imgUrl);

    fileHelper.deleteFile(filePath);
    await Teacher.findByIdAndDelete(teacherId);
    res.redirect("/teachers");
  } catch (err) {
    // next(new Error(err));
    console.log(err);
  }
};

exports.postDeleteCourse = async (req, res, next) => {
  const courseId = req.body.courseId;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      req.flash("error", "course not found");
      return next(new Error("course not found."));
    }
    const filePath = path.join(__dirname, "..", "public", course.imgUrl);

    fileHelper.deleteFile(filePath);
    await Course.findByIdAndDelete(courseId);
    res.redirect("/courses");
  } catch (err) {
    // next(new Error(err));
    console.log(err);
  }
};

exports.postDeleteService = async (req, res, next) => {
  const serviceId = req.body.serviceId;

  try {
    const service = await Service.findById(serviceId);
    if (!service) {
      req.flash("error", "service not found");
      return next(new Error("service not found."));
    }
    const filePath = path.join(__dirname, "..", "public", service.imgUrl);

    fileHelper.deleteFile(filePath);
    await Service.findByIdAndDelete(serviceId);
    res.redirect("/services");
  } catch (err) {
    next(new Error(err));
  }
};

exports.postDeleteAlumni = async (req, res, next) => {
  const alumniId = req.body.alumniId;

  try {
    const alumni = await Alumni.findById(alumniId);
    if (!alumni) {
      req.flash("error", "Alumni not found");
      return next(new Error("alumni not found."));
    }
    const filePath = path.join(__dirname, "..", "public", alumni.imgUrl);

    fileHelper.deleteFile(filePath);
    await Alumni.findByIdAndDelete(alumniId);
    res.redirect("/");
  } catch (err) {
    // next(new Error(err));
    console.log(err);
  }
};

// Initialize Payment

exports.postPayment = async (req, res, next) => {
  const { email, amount, courseId } = req.body;

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Convert Naira to kobo
        metadata: {
          courseId, // Store course info for future reference
        },
        callback_url: `https://www.citedu.org/payment/callback`,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    // Redirect user to Paystack payment page
    const { authorization_url } = response.data.data;
    res.redirect(authorization_url);
  } catch (err) {
    console.error("Error initializing payment:", err.response.data);
    res.status(500).json({ error: "Failed to initialize payment" });
  }
};

exports.getPayment = async (req, res) => {
  const { reference } = req.query; // Extract reference from query parameters

  try {
    // Verify payment with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paymentData = response.data.data;

    if (paymentData.status === "success") {
      // Mark the course as purchased for the user
      const userId = req.session.user._id;
      const courseId = paymentData.metadata.courseId;

      await User.findByIdAndUpdate(userId, {
        $addToSet: { purchasedCourses: courseId },
      });

      res.render("payment", {
        user: req.session.user,
        path: "/payment",
        pageTitle: "Payment Successful",
        status: "success",
        message:
          "Your payment was successful! You now have access to the course.",
        course: courseId,
      });
    } else {
      res.render("payment", {
        pageTitle: "Payment Failed",
        status: "failure",
        path: "/payment",
        message: "Your payment could not be processed. Please try again.",
      });
    }
  } catch (err) {
    console.error(
      "Error verifying payment:",
      err.response?.data || err.message
    );
    res.status(500).render("payment", {
      pageTitle: "Payment Failed",
      status: "failure",
      path: "/payment",
      message: "Your payment could not be processed. Please try again.",
    });
  }
};
