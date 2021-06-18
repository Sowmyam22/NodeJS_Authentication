const User = require('../models/user');

exports.getLogin = (req, res) => {
  // const isLoggedIn = req.get('Cookie').split(';')[1].trim().split('=')[1];

  // const isLoggedIn = req.get('Cookie').split('=')[1] === 'true';

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false
  });
};

exports.postLogin = (req, res) => {
  // req.isLoggedIn = true; // need to be set globally

  // res.setHeader('Set-Cookie', 'isLoggedIn = true'); // setting the cookie

  User.findByPk(1)
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save(err => {
        console.log(err);
        res.redirect('/');
      })
    })
    .catch(err => console.log(err));
}

//logout and delete the cookie

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
}
