import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import LoginPage from '../views/LoginPage.vue';
import SignupPage from '../views/SignupPage.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import UserDashboard from '../views/UserDashboard.vue'; // Import UserDashboard
import ChatBot from '../views/userChatbot.vue'; // Import ChatBot

const routes = [
  {
    path: '/',
    redirect: '/login' // Redirect root to the login page
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresUnauth: true } // Only accessible if not authenticated
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupPage,
    meta: { requiresUnauth: true } // Only accessible if not authenticated
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: true } // Requires user to be authenticated
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminDashboard,
    meta: { requiresAuth: true } // Requires user to be authenticated
  },
  {
    path: '/userdashboard',
    name: 'UserDashboard',
    component: UserDashboard,
    meta: { requiresAuth: true } // Requires user to be authenticated
  },
  {
    path: '/chatBot',
    name: 'ChatBot',
    component: ChatBot,
    meta: { requiresAuth: true } // Requires user to be authenticated
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
