// filepath: c:\harmonilink\frontend\src\router.js
import { createRouter, createWebHistory } from 'vue-router';
import Signup from './views/Signup.vue';
import Login from './views/Login.vue';
import Terms from './views/Terms.vue';
import ForgotPassword from './views/ForgotPassword.vue';
import PfCustom from './views/PfCustom.vue';
import PfMixtape from './views/PfMixtape.vue';
import Welcome from './views/Welcome.vue';

const routes = [
  { path: '/', redirect: '/signup' }, // Redirect root to signup
  { path: '/signup', component: Signup },
  { path: '/login', component: Login },
  { path: '/home', component: () => import('./views/Home.vue') }, // Example home route
  { path: '/terms', component: Terms },
  { path: '/forgot-password', component: ForgotPassword }, 
  {path: '/pfcustom', component: PfCustom}, 
  {path: '/pfmixtape', component: PfMixtape},
  {path: '/welcome', component: Welcome}, // Example welcome route
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Add a navigation guard
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';

  if (to.path === '/home' && !isLoggedIn) {
    // Redirect unauthenticated users to login
    next('/login');
  } else {
    next(); // Allow navigation
  }
});

export default router;