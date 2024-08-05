<template>
  <div :class="['admin-dashboard', 'min-h-screen flex', { 'dark-mode': isDarkMode }]">
    <!-- Sidebar -->
    <div :class="['w-64 shadow-lg p-6 sidebar-bg', { 'hidden': !sidebarOpen }]">
      <div class="flex items-center justify-center mb-6">
        <img src="@/assets/newlogo.jpg" alt="Logo" class="w-24 h-24 rounded-full border-black border animate-fade-in">
      </div>
      <div class="flex items-center space-x-4 animate-slide-in">
        <img src="@/assets/linkedinavatar.jpg" alt="User Avatar" class="w-12 h-12 rounded-full">
        <div>
          <h2 class="text-lg font-semibold text-white">Book Worm Administration</h2>
          <p class="text-sm text-gray-200">Admin</p>
        </div>
      </div>
      <div class="mt-6">
        <button @click="toggleGenreButtons" class="btn btn-blue w-full">Genre</button>
        <div v-if="showGenreButtons" class="mt-4">
          <button
            v-for="genre in genres"
            :key="genre"
            @click="filterByGenre(genre)"
            class="btn btn-gray w-full mb-2"
          >
            {{ genre }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 p-8 bg-main-content animate-fade-in-up">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <button @click="sidebarOpen = !sidebarOpen" class="btn btn-gray">☰</button>
        </div>
        <h1 :class="['book-details-title', { 'dark-mode-title': isDarkMode }]">Book Details</h1>
        <div>
          <button @click="toggleDarkMode" class="btn transparent-btn">Toggle Dark Mode</button>
          <button @click="logout" class="btn transparent-btn ml-2">Logout</button>
          <button @click="registerFingerprint" class="btn transparent-btn ml-2">Register Fingerprint</button>
        </div>
      </div>

      <!-- Add Book Button -->
      <div class="mb-6 flex justify-end animate-slide-in-right">
        <button @click="showAddBookModal = true" class="btn transparent-btn">+ Add New Book</button>
      </div>

      <!-- Books Table -->
      <div class="table-container overflow-x-auto shadow-md rounded-lg animate-zoom-in" :class="{ 'dark-mode-table': isDarkMode }">
        <table class="min-w-full divide-y divide-gray-200">
          <thead :class="[{ 'bg-gray-50': !isDarkMode, 'bg-gray-700': isDarkMode }]">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cover</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book URL</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody :class="[{ 'bg-white': !isDarkMode, 'bg-gray-800': isDarkMode, 'divide-y': true, 'divide-gray-200': true }]">
            <tr v-for="(book, index) in filteredBooks" :key="book.id" class="animate-fade-in-up">
              <td class="px-6 py-4 whitespace-nowrap">{{ index + 1 }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <img :src="book.imgURL" alt="Book Image" class="h-16 w-16 object-cover cursor-pointer" @click="showImageModal(book.imgURL)" />
              </td>
              <td :class="['px-6 py-4 whitespace-nowrap', { 'dark-mode-text': isDarkMode, 'text-black': !isDarkMode }]">{{ truncateText(book.title, 20) }}</td>
              <td :class="['px-6 py-4 whitespace-nowrap', { 'dark-mode-text': isDarkMode, 'text-black': !isDarkMode }]">{{ book.year }}</td>
              <td :class="['px-6 py-4 whitespace-nowrap', { 'dark-mode-text': isDarkMode, 'text-black': !isDarkMode }]">{{ book.author }}</td>
              <td :class="['px-6 py-4 whitespace-nowrap', { 'dark-mode-text': isDarkMode, 'text-black': !isDarkMode }]">{{ book.genre }}</td>
              <td :class="['px-6 py-4 whitespace-nowrap', { 'dark-mode-text': isDarkMode, 'text-black': !isDarkMode }]">
                <a :href="book.bookURL" target="_blank" class="text-blue-500 hover:underline">{{ book.bookURL }}</a>
              </td>
              <td class="px-6 py-4 whitespace-nowrap actions">
                <button @click="editBook(book)" class="btn btn-blue">Edit</button>
                <button @click="deleteBook(book.id)" class="btn btn-red ml-2">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add Book Modal -->
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-smoke-light animate-fade-in" v-if="showAddBookModal">
        <div class="bg-white w-full max-w-md p-8 rounded-lg shadow-lg">
          <h3 class="text-xl font-bold mb-4 text-indigo-700">Add New Book</h3>
          <form @submit.prevent="createBook">
            <input type="file" @change="onFileChange" />
            <div class="mb-4">
              <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" id="title" v-model="newBook.title" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <div class="mb-4">
              <label for="author" class="block text-sm font-medium text-gray-700">Author</label>
              <input type="text" id="author" v-model="newBook.author" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <div class="mb-4">
              <label for="year" class="block text-sm font-medium text-gray-700">Year</label>
              <select id="year" v-model="newBook.year" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
            <div class="mb-4">
              <label for="genre" class="block text-sm font-medium text-gray-700">Genre</label>
              <select id="genre" v-model="newBook.genre" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
              </select>
            </div>
            <div class="mb-4">
              <label for="bookURL" class="block text-sm font-medium text-gray-700">Book URL</label>
              <input type="url" id="bookURL" v-model="newBook.bookURL" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <button type="submit" class="btn btn-blue">Add Book</button>
          </form>
          <button @click="showAddBookModal = false" class="btn btn-red mt-4">Close</button>
        </div>
      </div>

      <!-- Edit Book Modal -->
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-smoke-light animate-fade-in" v-if="editBookData.id">
        <div class="bg-white w-full max-w-md p-8 rounded-lg shadow-lg">
          <h3 class="text-xl font-bold mb-4 text-indigo-700">Edit Book</h3>
          <form @submit.prevent="updateBook">
            <div class="mb-4">
              <label for="editTitle" class="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" id="editTitle" v-model="editBookData.title" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <div class="mb-4">
              <label for="editAuthor" class="block text-sm font-medium text-gray-700">Author</label>
              <input type="text" id="editAuthor" v-model="editBookData.author" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <div class="mb-4">
              <label for="editYear" class="block text-sm font-medium text-gray-700">Year</label>
              <select id="editYear" v-model="editBookData.year" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
            <div class="mb-4">
              <label for="editGenre" class="block text-sm font-medium text-gray-700">Genre</label>
              <select id="editGenre" v-model="editBookData.genre" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
              </select>
            </div>
            <div class="mb-4">
              <label for="editBookURL" class="block text-sm font-medium text-gray-700">Book URL</label>
              <input type="url" id="editBookURL" v-model="editBookData.bookURL" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <button type="submit" class="btn btn-blue">Update Book</button>
          </form>
          <button @click="editBookData.id = null" class="btn btn-red mt-4">Close</button>
        </div>
      </div>

      <!-- Image Modal -->
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-smoke-light animate-fade-in" v-if="showImageModalFlag">
        <div class="bg-white p-4 rounded-lg shadow-lg max-w-3xl w-full relative">
          <button @click="closeImageModal" class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full">&times;</button>
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
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export default {
  name: 'AdminDashboard',
  setup() {
    const router = useRouter();
    const storage = getStorage(); // Initialize Firebase storage

    const bookService = interpret(bookMachine).start();
    const sidebarOpen = ref(true); // Sidebar state
    const isDarkMode = ref(false); // Dark mode state
    const showGenreButtons = ref(false); // Genre button state

    const newBook = ref({
      title: '',
      author: '',
      year: '',
      genre: '',
      bookURL: '', // Add bookURL to newBook object
      imgFile: null // Add imgFile to store the file object
    });
    const editBookData = ref({
      id: '',
      title: '',
      author: '',
      year: '',
      genre: '',
      bookURL: '' // Add bookURL to editBookData object
    });
    const showAddBookModal = ref(false);
    const showImageModalFlag = ref(false);
    const currentImage = ref('');

    const books = ref([]);
    const filteredBooks = ref([]);

    const years = Array.from({ length: 2024 - 1900 + 1 }, (_, i) => 1900 + i); // Array of years from 1900 to 2024
    const genres = ['Fiction', 'Non-fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Biography']; // Example genres

    // Fetch books on startup
    bookService.send({ type: 'FETCH_BOOKS' });

    bookService.onTransition((state) => {
      if (state.matches('authenticated')) {
        books.value = state.context.books;
        filteredBooks.value = books.value; // Initialize filteredBooks with all books
      } else if (state.matches('error')) {
        Swal.fire('Error', state.context.error, 'error');
      }
    });

    const createBook = async () => {
      if (newBook.value.title && newBook.value.author && newBook.value.year && newBook.value.genre && newBook.value.imgFile && newBook.value.bookURL) {
        try {
          // Upload image to Firebase Storage
          const imageRef = storageRef(storage, `images/${newBook.value.imgFile.name}`);
          await uploadBytes(imageRef, newBook.value.imgFile);
          const imageUrl = await getDownloadURL(imageRef);

          // Add book with image URL to the store
          const bookData = { ...newBook.value, imgURL: imageUrl, imgFile: undefined }; // Do not include imgFile in Firestore
          bookService.send({ type: 'CREATE_BOOK', data: bookData });

          Swal.fire('Success', 'Book added successfully', 'success');
          newBook.value = { title: '', author: '', year: '', genre: '', bookURL: '', imgFile: null };
          showAddBookModal.value = false;
        } catch (error) {
          Swal.fire('Error', 'Failed to add book', 'error');
          console.error('Error adding book:', error);
        }
      } else {
        Swal.fire('Error', 'Please fill all fields and select an image', 'error');
      }
    };

    const editBook = (book) => {
      editBookData.value = { ...book };
      showAddBookModal.value = false;
    };

    const updateBook = async () => {
      if (editBookData.value.title && editBookData.value.author && editBookData.value.year && editBookData.value.genre && editBookData.value.bookURL) {
        bookService.send({ type: 'UPDATE_BOOK', data: editBookData.value });
        editBookData.value = { id: '', title: '', author: '', year: '', genre: '', bookURL: '' };
        Swal.fire('Success', 'Book updated successfully', 'success');
      } else {
        Swal.fire('Error', 'Please fill all fields', 'error');
      }
    };

    const deleteBook = async (bookId) => {
      bookService.send({ type: 'DELETE_BOOK', data: bookId });
      Swal.fire('Deleted', 'Book deleted successfully', 'success');
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

    const toggleGenreButtons = () => {
      showGenreButtons.value = !showGenreButtons.value;
    };

    const filterByGenre = (genre) => {
      filteredBooks.value = books.value.filter(book => book.genre === genre);
    };

    const logout = () => {
      bookService.send('LOGOUT');
      router.push('/login'); // Redirect to login page
    };

    const truncateText = (text, maxLength) => {
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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
      sidebarOpen,
      isDarkMode,
      newBook,
      editBookData,
      showAddBookModal,
      books,
      years,
      genres,
      createBook,
      editBook,
      updateBook,
      deleteBook,
      showImageModal,
      closeImageModal,
      showImageModalFlag,
      currentImage,
      toggleDarkMode,
      logout,
      truncateText,
      showGenreButtons,
      toggleGenreButtons,
      filterByGenre,
      filteredBooks,
      registerFingerprint,
    };
  },
  methods: {
    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.newBook.imgFile = file;
      }
    }
  }
};
</script>

<style scoped>
.bg-smoke-light {
  background-color: rgba(0, 0, 0, 0.5);
}

.bg-main-content {
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

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-align: center;
  width: auto;
  transition: transform 0.2s ease;
}

.btn:hover {
  transform: scale(1.05);
}

.btn-blue {
  background-color: #0275d8;
  color: white;
}

.btn-blue:hover {
  background-color: #025aa5;
}

.btn-red {
  background-color: #d9534f;
  color: white;
}

.btn-red:hover {
  background-color: #c9302c;
}

.btn-gray {
  background-color: #6c757d;
  color: white;
}

.btn-gray:hover {
  background-color: #5a6268;
}

.book-details-title {
  font-family: 'Dancing Script', cursive;
  font-size: 3rem;
  color: #4caf50; /* Green color */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* Subtle shadow for better readability */
}

.dark-mode-title {
  color: #81c784; /* Lighter green for dark mode */
}

.tagline {
  font-family: 'Dancing Script', cursive;
  font-size: 1.25rem;
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

.table-container {
  max-width: 100%;
  overflow-x: auto;
}

@media (max-width: 640px) {
  .admin-dashboard {
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

.dark-mode {
  background-color: #1a202c;
  color: #cbd5e0;
}

.dark-mode .bg-main-content {
  background-image: url('@/assets/bgimage-dark.jpg'); /* Add a dark mode background image */
}

.dark-mode .sidebar-bg {
  background: linear-gradient(135deg, #2d3748, #1a202c);
  color: #cbd5e0;
}

.dark-mode .btn {
  background-color: #2d3748;
  color: #cbd5e0;
}

.dark-mode .btn:hover {
  background-color: #4a5568;
}

.dark-mode .btn-blue {
  background-color: #3182ce;
  color: white;
}

.dark-mode .btn-blue:hover {
  background-color: #2b6cb0;
}

.dark-mode .btn-red {
  background-color: #e53e3e;
  color: white;
}

.dark-mode .btn-red:hover {
  background-color: #c53030;
}

.dark-mode-table {
  background-color: #2d3748;
  color: #cbd5e0;
}

.dark-mode-text {
  color: #cbd5e0;
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

/* Fade-in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

/* Fade-in up animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-in-out;
}

/* Slide-in animation */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slideIn 0.5s ease-in-out;
}

/* Slide-in from right animation */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in-right {
  animation: slideInRight 0.5s ease-in-out;
}

/* Zoom-in animation */
@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-zoom-in {
  animation: zoomIn 0.5s ease-in-out;
}
</style>
