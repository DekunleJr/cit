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
const User = require('../models/user');
const axios = require('axios');
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;




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
            pageTitle: 'Teachers'
        })
    } catch (err) {
        next(new Error(err));
    }
};

exports.getMyCourses = async (req, res) => {
    try {
        const userId = req.session.user._id; 

        const user = await User.findById(userId).populate('purchasedCourses');

        if (!user) {
            return res.status(404).render('error', { 
                pageTitle: 'Error', 
                message: 'User not found' 
            });
        }

        // Get the purchased courses (populated from the User model)
        const myCourses = user.purchasedCourses;

        // Render the "My Courses" page
        res.render('myCourse', { 
            pageTitle: 'My Courses',
            path: '/myCourses',
            course: myCourses 
        });

    } catch (error) {
        console.error('Error fetching user courses:', error);
        res.status(500).render('error', { 
            pageTitle: 'Error', 
            message: 'An error occurred while retrieving your courses.' 
        });
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
    const { title, description, date, location, button} = req.body;
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
            imgUrl,
            button
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
    let { title, description, date, price} = req.body;
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
            price,
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
            host: 'smtp.zoho.com', 
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
        const courses = await Course.find();
        const course = await Course.findById(prodId);
        if (!course) {
            return res.status(404).render('error', {
                path: '/404',
                pageTitle: 'Course Not Found',
                isAuthenticated: req.session.isLoggedIn,
            });
        }
        res.render('course-single', {
            courses: courses,
            course: course,
            user: req.session.user,
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

// Initialize Payment

exports.postPayment = async (req, res, next) => {
    const { email, amount, courseId } = req.body;

    try {
        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
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
        console.error('Error initializing payment:', err.response.data);
        res.status(500).json({ error: 'Failed to initialize payment' });
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

        if (paymentData.status === 'success') {
            // Mark the course as purchased for the user
            const userId = req.session.user._id;
            const courseId = paymentData.metadata.courseId;

            await User.findByIdAndUpdate(userId, {
                $addToSet: { purchasedCourses: courseId },
            });

            res.render('payment', {
                user: req.session.user,
                path: '/payment',
                pageTitle: 'Payment Successful',
                status: 'success',
                message: 'Your payment was successful! You now have access to the course.',
                course: courseId,
            });
        } else {
            res.render('payment', {
                pageTitle: 'Payment Failed',
                status: 'failure',
                path: '/payment',
                message: 'Your payment could not be processed. Please try again.',
            });
        }
    } catch (err) {
        console.error('Error verifying payment:', err.response?.data || err.message);
        res.status(500).render('payment', {
            pageTitle: 'Payment Failed',
            status: 'failure',
            path: '/payment',
            message: 'Your payment could not be processed. Please try again.',
        });
    }
};
