const withAuth = (req,res, next) => {
    if(!req.session.id || req.session.loggedIn === false){
        res.redirect('/login');
    }else{next()};
}

module.exports = withAuth;

