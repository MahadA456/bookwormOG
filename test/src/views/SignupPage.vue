<template>
  <div class="signup-page min-h-screen flex items-center justify-center">
    <div class="w-full max-w-md p-5">
      <div class="bg-custom rounded-lg shadow-lg p-6 animate__animated animate__fadeInDown">
        <img src="@/assets/newlogo.jpg" alt="Logo" class="w-24 h-24 mx-auto mb-2 rounded-full border-black border animate__animated animate__bounceIn">
        <p class="tagline text-center mb-6 text-gray-700 animate__animated animate__fadeIn">Get Lost In a Good Book</p>
        <h1 class="text-2xl text-center font-semibold mb-6 text-gray-800 animate__animated animate__fadeIn">Sign Up</h1>
        <form @submit.prevent="performSignup" class="space-y-4 animate__animated animate__fadeInUp">
          <div class="mb-4">
            <label for="email" class="block text-gray-700 font-medium mb-2">Email address</label>
            <input type="email" id="email" v-model="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200">
          </div>
          <div class="mb-4">
            <label for="password" class="block text-gray-700 font-medium mb-2">Password</label>
            <input type="password" id="password" v-model="password" @keyup="checkCapsLock" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200">
            <p v-if="isCapsLockOn" class="text-red-500 text-sm mt-2">Caps Lock is on</p>
          </div>
          <div class="mb-4">
            <label for="confirmPassword" class="block text-gray-700 font-medium mb-2">Confirm Password</label>
            <input type="password" id="confirmPassword" v-model="confirmPassword" @keyup="checkCapsLock" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200">
            <p v-if="isCapsLockOn" class="text-red-500 text-sm mt-2">Caps Lock is on</p>
          </div>
          <div v-if="errorShow" class="error">{{ errorMsg }}</div>
          <button type="submit" class="w-full bg-signup-button text-white py-2 rounded-lg hover:bg-signup-button-hover transition duration-200 transform hover:scale-105">Sign Up</button>
          <p class="mt-4 text-center text-gray-600">Already have an account? <router-link to="/login" class="text-signup-link hover:underline">Login Here</router-link></p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { registerUser } from '../state/services';

export default {
  name: 'SignupPage',
  setup() {
    const router = useRouter();
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const isCapsLockOn = ref(false);
    const errorMsg = ref('');
    const errorShow = ref(false);

    const performSignup = async () => {
      if (password.value !== confirmPassword.value) {
        errorMsg.value = 'Passwords do not match';
        errorShow.value = true;
        return;
      }

      try {
        await registerUser({ email: email.value, password: password.value });
        Swal.fire('Success', 'Signup successful. Please login.', 'success');
        router.push('/login');
      } catch (error) {
        errorMsg.value = error.message;
        errorShow.value = true;
        Swal.fire('Error', error.message, 'error');
      }
    };

    const checkCapsLock = (event) => {
      isCapsLockOn.value = event.getModifierState('CapsLock');
    };

    return {
      email,
      password,
      confirmPassword,
      isCapsLockOn,
      errorMsg,
      errorShow,
      performSignup,
      checkCapsLock,
    };
  },
};
</script>

<style scoped>
.signup-page {
  background-image: url('@/assets/bgimage.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}
.bg-custom {
  background-color: #F2F1EB;
}
.bg-signup-button {
  background-color: #1A5319;
}
.bg-signup-button-hover {
  background-color: #144213;
}
.text-signup-link {
  color: #1A5319;
}
.tagline {
  font-family: 'Dancing Script', cursive;
  font-size: 1.25rem;
}
img {
  border: 2px solid black;
}
@media (max-width: 640px) {
  .signup-page {
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
