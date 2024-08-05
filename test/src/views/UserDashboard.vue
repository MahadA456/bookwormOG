<template>
  <div :class="['user-dashboard min-h-screen flex', { 'dark-mode': isDarkMode }]">
    <!-- Sidebar -->
    <div :class="['w-64 shadow-lg p-6 sidebar-bg', { 'dark-mode-sidebar': isDarkMode }]">
      <div class="flex items-center justify-center mb-6">
        <img src="@/assets/newlogo.jpg" alt="Logo" class="w-24 h-24 rounded-full border-black border">
      </div>
      <h2 :class="['text-center text-lg font-semibold mb-4', { 'text-white': !isDarkMode, 'text-gray-200': isDarkMode }]">Book Worm</h2>
      <p :class="['text-center text-sm mb-6 tagline', { 'text-gray-200': !isDarkMode, 'text-gray-400': isDarkMode }]">Get Lost In a Good Book</p>
      <h3 :class="['text-lg font-semibold mb-4', { 'text-white': !isDarkMode, 'text-gray-200': isDarkMode }]">Genres</h3>
      <ul>
        <li v-for="genre in genres" :key="genre" class="mb-2">
          <button @click="filterByGenre(genre)" class="transparent-btn">{{ genre }}</button>
        </li>
      </ul>
    </div>

    <!-- Main Content -->
    <div :class="['flex-1 p-8 bg-main-content', { 'dark-mode-main': isDarkMode }]">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <button @click="navigateToChatBot" class="btn transparent-btn">BookWorm Chat Bot</button>
        </div>
        <div class="w-full flex justify-center">
          <input type="text" v-model="searchQuery" @input="searchByAuthor" placeholder="Search by Author" :class="['w-1/2 px-4 py-2 border rounded-lg shadow-sm', { 'border-gray-300': !isDarkMode, 'border-gray-600': isDarkMode, 'focus:ring-indigo-500 focus:border-indigo-500': !isDarkMode, 'focus:ring-indigo-400 focus:border-indigo-400': isDarkMode }]">
        </div>
        <div class="flex items-center space-x-2">
          <button @click="toggleDarkMode" class="btn transparent-btn">Toggle Dark Mode</button>
          <button @click="logout" class="btn transparent-btn">Logout</button>
          <button @click="registerFingerprint" class="btn transparent-btn">Register Fingerprint</button>
        </div>
      </div>

      <!-- Books List -->
      <div v-if="filteredBooks.length > 0" class="flex justify-center">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="book in filteredBooks" :key="book.id" :class="['bg-white p-4 rounded-lg shadow-lg', { 'dark-mode-book': isDarkMode }]">
            <img :src="book.imgURL" alt="Book Image" class="h-32 w-full object-cover mb-4 rounded-lg cursor-pointer" @click="showImageModal(book.imgURL)">
            <h3 :class="['text-lg font-semibold', { 'text-gray-800': !isDarkMode, 'text-gray-200': isDarkMode }]">{{ book.title }}</h3>
            <p :class="['text-gray-600', { 'text-gray-400': isDarkMode }]">Author: {{ book.author }}</p>
            <p :class="['text-gray-600', { 'text-gray-400': isDarkMode }]">Year: {{ book.year }}</p>
            <p :class="['text-gray-600', { 'text-gray-400': isDarkMode }]">Genre: {{ book.genre }}</p>
            <p v-if="book.bookURL" :class="['text-gray-600', { 'text-gray-400': isDarkMode }]">
              <a :href="book.bookURL" target="_blank" class="underline text-blue-600 dark:text-blue-400">Read More</a>
            </p>
          </div>
        </div>
      </div>

      <!-- Image Modal -->
      <div v-if="showImageModalFlag" class="fixed inset-0 z-50 flex items-center justify-center bg-smoke-light">
        <div :class="['p-4 rounded-lg shadow-lg max-w-3xl w-full relative', { 'bg-white': !isDarkMode, 'bg-gray-800': isDarkMode }]">
          <button @click="closeImageModal" :class="['absolute top-2 right-2 p-1 rounded-full', { 'bg-red-500 text-white': !isDarkMode, 'bg-red-400 text-gray-200': isDarkMode }]">&times;</button>
          <img :src="currentImage" alt="Book Image" class="w-full h-auto object-cover rounded-lg">
        </div>
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
import { webAuthnRegister } from '../state/services';

export default {
  name: 'UserDashboard',
  setup() {
    const router = useRouter();
    const bookService = interpret(bookMachine).start();

    const searchQuery = ref('');
    const filteredBooks = ref([]);
    const genres = ref([]);
    const books = ref([]);
    const showImageModalFlag = ref(false);
    const currentImage = ref('');
    const isDarkMode = ref(false);

    bookService.send({ type: 'FETCH_BOOKS' });
    bookService.onTransition((state) => {
      if (state.matches('authenticated')) {
        books.value = state.context.books;
        genres.value = [...new Set(state.context.books.map((book) => book.genre))];
        filteredBooks.value = books.value;
      } else if (state.matches('error')) {
        Swal.fire('Error', state.context.error, 'error');
      }
    });

    const filterByGenre = (genre) => {
      filteredBooks.value = books.value.filter(book => book.genre === genre);
      if (filteredBooks.value.length === 0) {
        Swal.fire('No Books Found', 'Sorry, no books were found for the selected genre.', 'info');
      }
    };

    const searchByAuthor = () => {
      filteredBooks.value = books.value.filter(book => book?.author?.toLowerCase().includes(searchQuery?.value?.toLowerCase()));
      if (filteredBooks.value.length === 0 && searchQuery.value.trim() !== '') {
        Swal.fire('No Books Found', 'Sorry, no books were found for the entered author.', 'info');
      }
    };

    const showImageModal = (imageUrl) => {
      currentImage.value = imageUrl;
      showImageModalFlag.value = true;
    };

    const closeImageModal = () => {
      showImageModalFlag.value = false;
      currentImage.value = '';
    };

    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value;
    };

    const logout = () => {
      bookService.send('LOGOUT');
      router.push('/login'); // Redirect to login page
    };

    const navigateToChatBot = () => {
      router.push('/chatBot');
    };

    const registerFingerprint = async () => {
      try {
        const currentUser = bookService.state.context.user;
        if (!currentUser) throw new Error('User is not authenticated');

        const registrationResult = await webAuthnRegister(currentUser);
        if (registrationResult) {
          Swal.fire('Success', 'Fingerprint registered successfully', 'success');
        } else {
          Swal.fire('Error', 'Failed to register fingerprint', 'error');
        }
      } catch (error) {
        console.error('Error registering fingerprint:', error);
        Swal.fire('Error', error.message, 'error');
      }
    };

    return {
      genres,
      searchQuery,
      filteredBooks,
      filterByGenre,
      searchByAuthor,
      logout,
      showImageModal,
      closeImageModal,
      showImageModalFlag,
      currentImage,
      toggleDarkMode,
      isDarkMode,
      navigateToChatBot,
      registerFingerprint
    };
  }
};
</script>

<style scoped>
.user-dashboard {
  background-image: url('@/assets/bgimage.jpg');
  background-size: cover;
  background-position: center;
}

.sidebar-bg {
  background: linear-gradient(135deg, #1a5319, #144213, #0275d8, #6c757d);
  background-size: 400% 400%;
  animation: gradientAnimation 10s ease infinite;
  color: white;
}

.bg-main-content {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-align: center;
  width: auto;
}

.tagline {
  font-family: 'Dancing Script', cursive;
  font-size: 1.25rem;
}

.bg-smoke-light {
  background-color: rgba(0, 0, 0, 0.5);
}

.transparent-btn {
  background-color: transparent;
  border: 2px solid #03c03c;
  color: #03c03c;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.transparent-btn:hover {
  background-color: #03c03c;
  color: white;
}

@media (max-width: 640px) {
  .user-dashboard {
    flex-direction: column;
  }
  .w-64 {
    width: 100%;
  }
  .flex-1 {
    width: 100%;
  }
  .btn {
    width: 100%;
  }
}

@keyframes gradientAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Dark Mode Styles */
.dark-mode {
  background-color: #121212;
  color: #e0e0e0;
}

.dark-mode-sidebar {
  background: linear-gradient(135deg, #121212, #1f1f1f, #2b2b2b, #383838);
  color: white;
}

.dark-mode-main {
  background-color: rgba(18, 18, 18, 0.8);
  color: #e0e0e0;
}

.dark-mode-book {
  background-color: #1f1f1f;
  color: #e0e0e0;
}

.book-details {
  color: inherit; /* This ensures that the text color is inherited based on the mode */
}

.dark-mode .book-details {
  color: #e0e0e0;
}

.dark-mode .bg-main-content {
  background-color: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(5px);
}
</style>
