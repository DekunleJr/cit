const express = require('express');
const router = express.Router();
const isAdmin = require('../util/isAdmin');
const isAuth = require('../controller/isAuth');
const controller = require('../controller/home');

router.get('/', controller.getindex);

router.get('/about', controller.getAbout);

router.get('/contact', controller.getContact);

router.get('/courses', controller.getCourses);

router.get('/services', controller.getServices);

router.get('/events', controller.getEvent);

router.get('/news', controller.getNews);

router.get('/teachers', controller.getTeacher);

router.get('/admin', isAdmin, controller.getAdmin);


router.post('/admin/teacher', controller.postTeachers);

router.post('/admin/event', controller.postEvent);

router.post('/admin/news', controller.postNews);

router.post('/admin/course', controller.postCourse);

router.post('/admin/service', controller.postService);

router.post('/admin/alumni', controller.postAlumni);

router.post('/send_mail', controller.postEmail);

router.post('/delete-news', isAdmin, controller.postDeleteNews);

router.post('/delete-event', isAdmin, controller.postDeleteEvent);

router.post('/delete-teacher', isAdmin, controller.postDeleteTeacher);

router.post('/delete-course', isAdmin, controller.postDeleteCourse);

router.post('/delete-service', isAdmin, controller.postDeleteService);

router.post('/delete-alumni', isAdmin, controller.postDeleteAlumni);

router.get('/:courseId', isAuth, controller.getCourse);

module.exports = router