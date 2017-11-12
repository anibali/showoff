import { Router } from 'express';
import passport from 'passport';


const signIn = (req, res) => {
  res.send();
};

const signOut = (req, res) => {
  req.logOut();
  res.send();
};

const verify = (req, res) => {
  if(!req.isAuthenticated()) {
    res.status(401);
  }
  res.send();
};

const router = Router();

router.route('/signin').post(passport.authenticate('local'), signIn);
router.route('/signout').post(signOut);
router.route('/verify').post(verify);


export default router;
