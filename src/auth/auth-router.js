const express = require('express');
const authRouter = express.Router();
const jsonBodyParser = express.json();
const AuthService = require('./auth-service');
const { requireAuth } = require('../middleware/jwt-auth');

authRouter
  .post('/login', jsonBodyParser, (req, res, next) => {
    const { email, password } = req.body;
    const loginUser = { email, password };

    for (const [key, value] of Object.entries(loginUser))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
    AuthService.getUserWithEmail(req.app.get('db'), loginUser.email)
      .then(dbUser => {
        if (!dbUser)
          return res.status(400).json({
            error: 'Incorrect email or password'
          });

        return AuthService.comparePasswords(loginUser.password, dbUser.password).then(
          comparematch => {
            if (!comparematch)
              return res.status(400).json({
                error: 'Incorrect email or password'
              });
            const sub = dbUser.email;
            const payload = { user_id: dbUser.id };

            res.send({
              authToken: AuthService.createJwt(sub, payload),
              payload: payload
            });
          }
        );
      })
      .catch(next);
  })
  .route('/') // route to get user id's from authentication token
  .all(requireAuth, (req, res, next) => {
    let user = { id: null };
    user.id = req.user.id;
    res.user = user; // save the user for the next middleware
    next();
  })
  .get((req, res, next) => {
    const user_id = res.user.id;
    res.json({ id: user_id });
  });

module.exports = authRouter;
