class Auth {
  constructor() {
    this.isAuthenticated = false;
  }

  signIn() {
    // TODO: Sign in via backend
    this.isAuthenticated = true;
    return new Promise((resolve) => setTimeout(resolve, 100));
  }

  signOut() {
    // TODO: Sign out via backend
    this.isAuthenticated = false;
    return new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export default new Auth();
