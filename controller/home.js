const path = require('path');
require('dotenv').config();
const Teacher = require('../models/teachers');
const Event = require('../models/event');
const News = require('../models/news');
const Course = require('../models/course');
const Service = require('../models/service');
const Alumni = require('../models/alumni');
const { formatDate } = require('../util/date');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const fileHelper = require('../util/file');


exports.getindex = async (req, res, next) => {
    try {
        const event = await Event.find();
        const service = await Service.find();
        const course = await Course.find();
        const teachers = await Teacher.find();
        const news = await News.find();
        const alumni = await Alumni.find();
        res.render('index', {
            service: service,
            news: news,
            alumni: alumni,
            course: course,
            events: event,
            teachers: teachers,
            path: '/',
            pageTitle: 'Home page'
        });
    } catch (err) {
        next(new Error(err));
    }
};

exports.getAbout = async (req, res, next) => {
    try{
        res.render('about', {
            path: '/about',
            pageTitle: 'About'
        });
    } catch (err) {
        next(new Error(err));
    }
};

exports.getContact = async (req, res, next) => {
    try {
        res.render('contact', {
            path: '/contact',
            pageTitle: 'Contact'
        })
    } catch (err) {
        next(new Error(err));
    }
};


exports.getCourses = async (req, res, next) => {
    try {
        const course = await Course.find();
        const teachers = await Teacher.find();
        res.render('courses', {
            teachers: teachers,
            course: course,
            path: '/courses',
            pageTitle: 'Courses'
        })
    } catch (err) {
        next(new Error(err));
    }
};




exports.getServices = async (req, res, next) => {
    try {
        const service = await Service.find();
        const teachers = await Teacher.find();
        res.render('services', {
            teachers: teachers,
            service: service,
            path: '/services',
            pageTitle: 'Services'
        })
    } catch (err) {
        next(new Error(err));
    }
};

exports.getEvent = async (req, res, next) => {
    try {
        const event = await Event.find();
        res.render('events', {
            events: event,
            path: '/events',
            pageTitle: 'Events'
        })
    } catch (err) {
        next(new Error(err));
    }
};

exports.getNews = async (req, res, next) => {
    try {
        const news = await News.find();
        res.render('news', {
            news: news,
            path: '/news',
            pageTitle: 'News'
        })
    } catch (err) {
        next(new Error(err));
    }
};


exports.getTeacher = async (req, res, next) => {
    try {
        const teachers = await Teacher.find();
        res.render('teachers', {
            teachers: teachers,
            path: '/teachers',
            pageTitle: 'About Teachers'
        })
    } catch (err) {
        next(new Error(err));
    }
};


exports.getAdmin = async (req, res, next) => {
    try {
        res.render('admin', {
            path: '/admin',
            pageTitle: 'Admin page'
        })
    } catch (err) {
        next(new Error(err));
    }
};

exports.postTeachers = async (req, res, next) => {
    const { name, profession, position, portUrl} = req.body;
    const image = req.file;
    if (!image) {
        return res.status(400).render('admin', {
            path: '/admin',
            pageTitle: 'Admin page'
        })
    }

    const imgUrl = 'img/' + req.file.filename;

    try {
        const teacher = new Teacher({
            name,
            profession,
            position,
            imgUrl,
            portUrl
        });

        await teacher.save();
        res.redirect('/teachers')
    } catch (err) {
        next(new Error(err));
    }

};

exports.postEvent = async (req, res, next) => {
    const { title, description, date, location,} = req.body;
    const image = req.file;
    if (!image) {
        return res.status(400).render('admin', {
            path: '/admin',
            pageTitle: 'Admin page'
        })
    }

    const imgUrl = 'img/' + req.file.filename;

    try {
        const event = new Event({
            title,
            description,
            date,
            location,
            imgUrl
        });

        await event.save();
        res.redirect('/events')
    } catch (err) {
        next(new Error(err));
    }

};

exports.postNews = async (req, res, next) => {
    const { title, description, date, position} = req.body;
    const image = req.file;
    if (!image) {
        return res.status(400).render('admin', {
            path: '/admin',
            pageTitle: 'Admin page'
        })
    }

    const imgUrl = 'img/' + req.file.filename;

    try {
        const news = new News({
            title,
            description,
            date,
            position,
            imgUrl
        });

        await news.save();
        res.redirect('/news')
    } catch (err) {
        console.log(err)
    }

};

exports.postCourse = async (req, res, next) => {
    let { title, description, date} = req.body;
    const image = req.file;
    if (!image) {
        return res.status(400).render('admin', {
            path: '/admin',
            pageTitle: 'Admin page'
        })
    }

    const imgUrl = 'img/' + req.file.filename;

        date = formatDate(date);

    try {
        const course = new Course({
            title,
            description,
            date,
            imgUrl
        });

        await course.save();
        res.redirect('/courses')
    } catch (err) {
        next(new Error(err));
    }

};

exports.postService = async (req, res, next) => {
    let { title, description} = req.body;
    const image = req.file;
    if (!image) {
        return res.status(400).render('admin', {
            path: '/admin',
            pageTitle: 'Admin page'
        })
    }

    const imgUrl = 'img/' + req.file.filename;

    try {
        const service = new Service({
            title,
            description,
            imgUrl
        });

        await service.save();
        res.redirect('/services')
    } catch (err) {
        console.log(err)
    }

};

exports.postAlumni = async (req, res, next) => {
    let { name, comment} = req.body;
    const image = req.file;
    if (!image) {
        return res.status(400).render('admin', {
            path: '/admin',
            pageTitle: 'Admin page'
        })
    }

    const imgUrl = 'img/' + req.file.filename;

    try {
        const alumni = new Alumni({
            name,
            comment,
            imgUrl
        });

        await alumni.save();
        res.redirect('/')
    } catch (err) {
        console.log(err)
    }

};

exports.postEmail = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,  
            },
        });
        const mailOptions = {
            from: email,          // Sender's email
            to: 'Info@citedu.org',   // Recipient's email
            subject: `New message from ${name} about ${subject}`, // Subject of the email
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`, // Body of the email
        };
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).send('Failed to send message');
            }
            res.redirect('/');
        });
    } catch (err) {
        next(new Error(eer));
    }
}

exports.getCourse = async (req, res, next) => {
    try {
        const prodId = req.params.courseId;
        if (!mongoose.Types.ObjectId.isValid(prodId)) {
            return next();
        }
        const course = await Course.findById(prodId);
        if (!course) {
            return res.status(404).render('error', {
                path: '/404',
                pageTitle: 'Course Not Found',
                isAuthenticated: req.session.isLoggedIn,
            });
        }
        res.render('course-single', {
            course: course,
            pageTitle: course.title,
            path: '/courses'
        })
    } catch (err) {
        console.log(err)
    }
};

exports.postDeleteNews = async (req, res, next) => { 
    const newsId = req.body.newsId;
    
    try {
        const news = await News.findById(newsId);
        if (!news) {
            req.flash('error', 'News not found')
            return next(new Error('News not found.'));
        }
        const filePath = path.join(__dirname, '..', 'public', news.imgUrl);
        fileHelper.deleteFile(filePath);
        await News.findByIdAndDelete(newsId);
        res.redirect('/news');
    } catch (err) {
        // next(new Error(err));
        console.log(err)
    }
};

exports.postDeleteEvent = async (req, res, next) => { 
    const eventId = req.body.eventId;
    
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            req.flash('error', 'event not found')
            return next(new Error('event not found.'));
        }
        const filePath = path.join(__dirname, '..', 'public', event.imgUrl);
        
        fileHelper.deleteFile(filePath);
        await Event.findByIdAndDelete(eventId);
        res.redirect('/events');
    } catch (err) {
        // next(new Error(err));
        console.log(err)
    }
};

exports.postDeleteTeacher = async (req, res, next) => { 
    const teacherId = req.body.teacherId;
    
    try {
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            req.flash('error', 'instructor not found')
            return next(new Error('instructor not found.'));
        }
        const filePath = path.join(__dirname, '..', 'public', teacher.imgUrl);
        
        fileHelper.deleteFile(filePath);
        await Teacher.findByIdAndDelete(teacherId);
        res.redirect('/teachers');
    } catch (err) {
        // next(new Error(err));
        console.log(err)
    }
};

exports.postDeleteCourse = async (req, res, next) => { 
    const courseId = req.body.courseId;
    
    try {
        const course = await Course.findById(courseId);
        if (!course) {
            req.flash('error', 'course not found')
            return next(new Error('course not found.'));
        }
        const filePath = path.join(__dirname, '..', 'public', course.imgUrl);
        
        fileHelper.deleteFile(filePath);
        await Course.findByIdAndDelete(courseId);
        res.redirect('/courses');
    } catch (err) {
        // next(new Error(err));
        console.log(err)
    }
};

exports.postDeleteService = async (req, res, next) => { 
    const serviceId = req.body.serviceId;
    
    try {
        const service = await Service.findById(serviceId);
        if (!service) {
            req.flash('error', 'service not found')
            return next(new Error('service not found.'));
        }
        const filePath = path.join(__dirname, '..', 'public', service.imgUrl);
        
        fileHelper.deleteFile(filePath);
        await Service.findByIdAndDelete(serviceId);
        res.redirect('/services');
    } catch (err) {
        next(new Error(err));
    }
};

exports.postDeleteAlumni = async (req, res, next) => { 
    const alumniId = req.body.alumniId;
    
    try {
        const alumni = await Alumni.findById(alumniId);
        if (!alumni) {
            req.flash('error', 'Alumni not found')
            return next(new Error('alumni not found.'));
        }
        const filePath = path.join(__dirname, '..', 'public', alumni.imgUrl);
        
        fileHelper.deleteFile(filePath);
        await Alumni.findByIdAndDelete(alumniId);
        res.redirect('/');
    } catch (err) {
        // next(new Error(err));
        console.log(err)
    }
};
