import { Router } from 'express';


// TODO: Obviously these shouldn't be hardcoded
const credentials = {
  username: 'admin',
  password: 'password',
};

const signIn = (req, res) => {
  const { username, password } = req.body;
  if(username === credentials.username && password === credentials.password) {
    // TODO: Start session
    res.send();
    return;
  }
  res.status(401).send();
};

const signOut = (req, res) => {
  // TODO: End session
  res.send();
};

const router = Router();

router.route('/signin').post(signIn);
router.route('/signout').post(signOut);


export default router;
