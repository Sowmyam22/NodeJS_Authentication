const crypto = require('crypto'); //this library helps to create unique, secure, random values

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: ''
  }
}));

exports.getLogin = (req, res) => {
  let message = req.flash('error');

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message // passsing the error message to the views
  });
};

exports.postLogin = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ where: { email: email } })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or pasword'); // setting the error message
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

          req.flash('error', 'Invalid email or pasword');
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
  let message = req.flash('error');

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'My Shop',
    errorMessage: message
  })
}

//creating a new user and redirect to login page
exports.postSignup = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  User.findOne({ where: { email: email } })
    .then(userData => {
      // find if user already exists

      if (userData) {
        req.flash('error', 'Email Already Exists!');
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
              return transporter.sendMail({
                to: email,
                from: 'shop-node@node-complete.com',
                subject: 'Signed Up Successfully!',
                html: '<h1>Your are signed in succeccfully! Go ahead and shop!</h1>'
              })
            })
            .catch(err => console.log(err));
        });
    })
    .catch(err => console.log(err));
}

exports.getReset = (req, res) => {
  let message = req.flash('error');

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'My Shop',
    errorMessage: message
  })
}

// send reset link and generate the token for that user
exports.postReset = (req, res) => {
  crypto.randomBytes(32, (err, buffer) => { // creates the random and unique token
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }

    const token = buffer.toString('hex');
    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (!user) {
          req.flash('error', 'No Account With That Email!');
          return res.redirect('/reset');
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect('/');
        return transporter.sendMail({
          to: req.body.email,
          from: 'shop-node@node-complete.com',
          subject: 'Password Reset Link!',
          html: `
          <p>You requested a password reset</p>
          <p>Click the <a href="http://localhost:3000/reset/${token}">link</a> to set the new password</p>
        `
        })
      })
      .catch(err => console.log(err));
  })
}

exports.getNewPassword = (req, res) => {
  const token = req.params.token;
  console.log(req.params.token);
  User.findOne({ where: { resetToken: token } })
    .then(user => {
      // console.log(user);
      let message = req.flash('error');

      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }

      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'My Shop',
        errorMessage: message,
        userId: user.id,
        passwordToken: token
      })
    })
    .catch(err => console.log(err));
}

// update the password
exports.postNewPassword = (req, res) => {
  const newPassword = req.body.password;
  const { userId, passwordToken } = req.body;

  let resetUser;

  User.findOne({
    where: {
      resetToken: passwordToken,
      id: userId
    }
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = null;
      resetUser.resetTokenExpiration = null;

      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => console.log(err));
}
