<template>
  <div class="container text-center py-5">
    <h1>Welcome to the Home Page!</h1>
    <p>This is your main area where you can place content or additional links.</p>
    <router-link to="/login" class="btn btn-primary">Login</router-link>
    <router-link to="/signup" class="btn btn-secondary">Signup</router-link>
    <button @click="handleLogout" class="btn btn-danger">Logout</button>
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'HomePage',
  setup() {
    const store = useStore();
    const router = useRouter();
    
    const handleLogout = () => {
      store.dispatch('logout');
      router.push('/login');
    };

    return {
      handleLogout
    };
  }
}
</script>

<style scoped>
.container {
  background-color: #f4f4f9;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.btn {
  margin: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
}

.btn-secondary {
  background-color: #6c757d;
}

.btn-danger {
  background-color: #dc3545;
}
</style>
