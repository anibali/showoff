import { Home, NotebookList, Notebook, Login, NotFound, Account } from './pages';

export default [
  {
    path: '/login',
    component: Login,
    exact: true,
    requiresAuth: false,
  },
  {
    path: '/account',
    component: Account,
    exact: true,
    requiresAuth: true,
  },
  {
    path: '/',
    component: Home,
    exact: true,
    requiresAuth: false,
  },
  {
    path: '/notebooks',
    component: NotebookList,
    exact: true,
    requiresAuth: true,
  },
  {
    path: '/notebooks/:id',
    component: Notebook,
    exact: true,
    requiresAuth: true,
  },
  {
    path: '',
    component: NotFound,
    exact: false,
    requiresAuth: false,
  }
];
