import axios from 'axios';

class Auth {
  constructor() {
    this.isAuthenticated = false;
  }

  signIn(username, password) {
    return axios.post('/auth/signin', { username, password }).then(() => {
      this.isAuthenticated = true;
    });
  }

  signOut() {
    return axios.post('/auth/signout').then(() => {
      this.isAuthenticated = false;
    });
  }
}

export default new Auth();
