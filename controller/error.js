exports.error = (req, res, next) => {
    res.status(404).render('error', {
        path: '/404',
        pageTitle: 'Page Not Found',
        isAuthenticated: req.session.isLoggedIn
    })
};

exports.get500 = (req, res, next) => {
    res.status(500).render('500', {
        path: '/500',
        pageTitle: 'Server Error',
        isAuthenticated: req.session.isLoggedIn
    })
};
