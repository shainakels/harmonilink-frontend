import { createRouter, createWebHistory } from 'vue-router';
import Signup from './views/Signup.vue';
import Login from './views/Login.vue';
import Terms from './views/Terms.vue';
import ForgotPassword from './views/ForgotPassword.vue';
import PfCustom from './views/PfCustom.vue';
import PfMixtape from './views/PfMixtape.vue';
import Welcome from './views/Welcome.vue';
import ResetPassword from './views/ResetPassword.vue';
import Discover from './views/Discover.vue';
import Favorites from './views/Favorites.vue';

const routes = [
  { 
    path: '/', 
    name: 'Root',
    beforeEnter: (to, from, next) => {
      const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
      const onboardingStep = localStorage.getItem('onboardingStep');

      if (!isLoggedIn) {
        next('/signup');
      } else {
        if (onboardingStep === 'pfcustom') next('/pfcustom');
        else if (onboardingStep === 'pfmixtape') next('/pfmixtape');
        else if (onboardingStep === 'welcome') next('/welcome');
        else next('/discover'); 
      }
    }
  },
  { path: '/signup', component: Signup },
  { path: '/login', component: Login },
  { path: '/discover', component: () => import('./views/Discover.vue') },
  { path: '/terms', component: Terms },
  { path: '/forgot-password', component: ForgotPassword }, 
  { path: '/pfcustom', component: PfCustom }, 
  { path: '/pfmixtape', component: PfMixtape },
  { path: '/welcome', component: Welcome },
  { path: '/reset-password', component: ResetPassword },
  { path: '/favorites', component: Favorites },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';

  const publicPages = ['/login', '/signup', '/terms', '/forgot-password', '/reset-password'];
  const isPublic = publicPages.includes(to.path);

  if (!isLoggedIn && !isPublic) {
    return next('/login');
  }

  next(); 
});

export default router;
