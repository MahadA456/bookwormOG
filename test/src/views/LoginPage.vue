<template>
  <div class="login-page min-h-screen flex items-center justify-center">
    <div class="w-full max-w-md p-5">
      <div class="bg-custom rounded-lg shadow-lg p-6 animate__animated animate__fadeInDown">
        <img src="@/assets/newlogo.jpg" alt="Logo" class="w-24 h-24 mx-auto mb-2 rounded-full border-black border animate__animated animate__bounceIn">
        <p class="tagline text-center mb-6 text-gray-700 animate__animated animate__fadeIn">Get Lost In a Good Book</p>
        <h1 class="text-2xl text-center font-semibold mb-6 text-gray-800 animate__animated animate__fadeIn">Login</h1>
        <p class="text-center mb-6 text-gray-500">Welcome onboard with us!</p>
        <form @submit.prevent="performLogin" class="space-y-4 animate__animated animate__fadeInUp">
          <div class="mb-4">
            <label for="email" class="block text-gray-700 font-medium mb-2">Email address</label>
            <input type="email" id="email" v-model="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200">
          </div>
          <div class="mb-4">
            <label for="password" class="block text-gray-700 font-medium mb-2">Password</label>
            <input type="password" id="password" v-model="password" @keyup="checkCapsLock" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200">
            <p v-if="isCapsLockOn" class="text-red-500 text-sm mt-2">Caps Lock is on</p>
          </div>
          <div class="flex items-center justify-between">
            <a href="#" class="text-sm text-gray-500 hover:underline">Forgot Password?</a>
          </div>
          <button type="submit" class="w-full bg-signup-button text-white py-2 rounded-lg hover:bg-signup-button-hover transition duration-200 transform hover:scale-105">Login</button>
          <button @click.prevent="loginWithFingerprint" class="w-full bg-signup-button text-white py-2 rounded-lg hover:bg-signup-button-hover transition duration-200 transform hover:scale-105 mt-4">Login with Fingerprint</button>
          <p class="mt-4 text-center text-gray-600">New to Bookworm? <router-link to="/signup" class="text-login-link hover:underline">Register Here</router-link></p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { interpret } from 'xstate';
import { bookMachine } from '../state/bookMachine';
import { webAuthnAuthenticate } from '../state/services';
import '../assets/tailwind.css';
import 'animate.css';

export default {
  name: 'LoginPage',
  setup() {
    const email = ref('');
    const password = ref('');
    const isCapsLockOn = ref(false);
    const router = useRouter();
    const bookService = interpret(bookMachine)
      .onTransition((state) => {
        console.log('Current state:', state.value);
        console.log('Context:', state.context);
        if (state.matches('authenticated')) {
          Swal.fire('Success', 'Login successful', 'success');
          const currentUser = state.context.user;
          console.log('Routing to appropriate dashboard');
          if (currentUser.isAdmin) {
            router.push('/admin');
          } else {
            router.push('/userdashboard');
          }
        } else if (state.matches('error')) {
          Swal.fire('Error', state.context.error || 'Login failed', 'error');
        }
      })
      .start();

    const performLogin = () => {
      bookService.send({ type: 'LOGIN', data: { email: email.value, password: password.value } });
    };

    const checkCapsLock = (event) => {
      isCapsLockOn.value = event.getModifierState('CapsLock');
    };

    const loginWithFingerprint = async () => {
      try {
        const success = await webAuthnAuthenticate();
        if (success) {
          bookService.send({ type: 'LOGIN', data: { email: 'admin@example.com', password: '' } });
        } else {
          Swal.fire('Error', 'Fingerprint authentication failed', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Fingerprint authentication failed', 'error');
      }
    };

    return {
      email,
      password,
      isCapsLockOn,
      performLogin,
      checkCapsLock,
      loginWithFingerprint,
    };
  },
};
</script>

<style scoped>
.login-page {
  background-image: url('@/assets/bgimage.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

.bg-custom {
  background-color: #f2f1eb;
}

.bg-signup-button {
  background-color: #1a5319;
}

.bg-signup-button-hover {
  background-color: #144213;
}

.text-login-link {
  color: #1a5319;
}

.tagline {
  font-family: 'Dancing Script', cursive;
  font-size: 1.25rem;
}

img {
  border: 2px solid black;
}

@media (max-width: 640px) {
  .login-page {
    padding: 1rem;
  }
  .bg-custom {
    padding: 2rem 1rem;
  }
  .tagline {
    font-size: 1rem;
  }
  .w-24 {
    width: 5rem;
    height: 5rem;
  }
  h1 {
    font-size: 1.5rem;
  }
  button {
    padding: 0.75rem 1rem;
  }
}
</style>
