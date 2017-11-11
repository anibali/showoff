import Home from './Home';
import Notebook from './Notebook';

export default [
  {
    path: '/',
    component: Home,
    exact: true,
  },
  {
    path: '/notebooks/:id',
    component: Notebook,
    exact: true,
  },
];
