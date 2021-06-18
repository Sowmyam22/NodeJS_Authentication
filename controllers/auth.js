const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = (req, res) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false
  });
};

exports.postLogin = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ where: { email: email } })
    .then(user => {
      if (!user) {
        return res.redirect('/login');
      }

      // check the incoming password with the encrypted password of the user
      
      bcrypt.compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            })
          }

          res.redirect('/login');
        })
        .catch(err => console.log(err));
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

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'My Shop',
    isAuthenticated: false
  })
}

//creating a new user and redirect to login page
exports.postSignup = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  User.findOne({ where: { email: email } })
    .then(userData => {
      // find if user already exists

      if (userData) {
        return res.redirect('/signup');
      }

      return bcrypt.hash(password, 12)
        .then(hashedPassword => {
          // if no user then create new User
          User.create({
            name: name,
            email: email,
            password: hashedPassword,
          })
            .then(user => {
              user.createCart();      // create cart for the user
            })
            .then(result => {
              res.redirect('/login');
            })
            .catch(err => console.log(err));
        });
    })
    .catch(err => console.log(err));
}
