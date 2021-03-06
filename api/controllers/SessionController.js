/**
 * SessionController
 *
 * @module      :: Controller
 * @description    :: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
    register: function (req, res) {
        res.view();
        req.session.flash = null;
    },

    registerUser: function (req, res) {
        var username = req.param('username');

//TODO: Fistly checkout the username have been used? if not, what the specific defintion about unique id, how about the work folow?
      Users.findOne({username : username}).done(function(err, user) {
           if(user) {
               req.session.flash = '此用户已存在，请登录或重新注册';
               res.redirect('/register');
           } else {
                Users.create(req.body).done(function(err, user) {
                    if(err) return console.log(err);

                    req.session.user = user;
                    res.redirect('/app/102/index.html');
                });
           }
      });
    },

    login: function (req, res) {
        //res.local.flash = _.clone(req.session.flash);
           res.view();
           req.session.flash = null; 
    },

    loginUser: function (req, res) {
        var username = req.param('username'),
            password = req.param('password'), 
            bcrypt = require('bcrypt');

//前提是登陆的“username”一定是唯一的
        Users.findOne({username: username}, function (err, user) {
            if (err) return console.log(err);
            if (user) {
                //找到用户，还要判断hash后的密码是否正确
                bcrypt.compare(password, user.password, function(err, same) {
                      // res == true
                      if(err) return console.log(err);
                      console.log('Check...');
                      if(!same) {
                          console.log('Password not correct...');
                          req.session.flash = '密码不正确，请重新登陆';
                          
                          res.redirect('/login');
                      }else{
                          req.session.user = user;
                          //req.session.flash = '登陆成功！';
                          req.session.flash = null;
                          res.redirect('/app/102/index.html');        
                      }
                });
                
            } else {
                req.session.flash = '用户不存在，请重新登陆或注册';
                res.redirect('/login');
            }
        });
    },


 /*   loginUser: function (req, res) {
        var username = req.param('username'),
            password = req.param('password');

        Users.findOne({username: username, password: password}, function (err, user) {
            if (err) return console.log(err);
            if (user) {
                req.session.user = user;
                req.session.message = 'Login Successfully!';
                res.redirect('/');
            } else {
                req.session.message = 'Username or Password is not match, Please try again';
                res.redirect('/login');
            }
        });
    },*/

    auth: function (req, res) {
        if (req.session.user) {
            res.send({
                'index': '/app/102/index.html'
            })
        } else {
            res.send(401);
        }
    },

    logout: function (req, res) {
        req.session.user = null;
        req.session.message = null;
        res.redirect('/');
    }
};
