import { createStore } from 'vuex';
import bcrypt from 'bcryptjs'; // Import bcryptjs
import persistState from './persist';
import { auth } from '../main'; // Import the auth instance
import { signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../main'; // Import the Firestore instance
import { webAuthnAuthenticate } from '../state/services'; // Corrected import path

const ADMIN_EMAIL = 'admin@example.com'; // Admin email
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('admin123', 10); // Hashed admin password

export default createStore({
  plugins: [persistState(500)], // Applying the persistState plugin with 500ms debounce
  state: {
    user: null,
    books: [],
    genres: ['Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Thriller', 'Biography', 'Other']
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setBooks(state, books) {
      state.books = books;
    },
    addBook(state, book) {
      state.books.push(book);
    },
    updateBook(state, updatedBook) {
      const index = state.books.findIndex(book => book.id === updatedBook.id);
      if (index !== -1) {
        state.books.splice(index, 1, updatedBook);
      }
    },
    deleteBook(state, bookId) {
      state.books = state.books.filter(book => book.id !== bookId);
    }
  },
  actions: {
    async login({ commit }, { email, password }) {
      if (email === ADMIN_EMAIL && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
        commit('setUser', { email, isAdmin: true });
        return true;
      } else {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          commit('setUser', { email: userCredential.user.email, uid: userCredential.user.uid });
          return true;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      }
    },
    async registerUser({ commit }, { email, password, confirmPassword }) {
      if (password !== confirmPassword) {
        console.error('Signup error: Passwords do not match');
        return false; // Passwords do not match
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        commit('setUser', { email: userCredential.user.email, uid: userCredential.user.uid });
        return true;
      } catch (error) {
        console.error('Signup error:', error);
        return false;
      }
    },
    async logout({ commit }) {
      try {
        await signOut(auth);
        commit('setUser', null);
        sessionStorage.removeItem('vuex-state'); // Clear Vuex state from session storage
        return true;
      } catch (error) {
        console.error('Logout error:', error);
        return false;
      }
    },
    autoLogin({ commit }) {
      const userData = JSON.parse(sessionStorage.getItem('vuex-state'));
      if (userData && userData.user) {
        commit('setUser', userData.user);
      }
    },
    async fetchBooks({ commit }) {
      try {
        const querySnapshot = await getDocs(collection(db, 'books'));
        const books = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        commit('setBooks', books);
      } catch (error) {
        console.error('Failed to fetch books:', error);
      }
    },
    async createBook({ commit }, book) {
      console.log(book)
      const bookdata={author:book.author,
        genre:book.genre,
        title:book.title,
        imgURL:book.imgURL,
        year:book.year,
        bookURL: book.bookURL
      
      };
      try {
        const docRef = await addDoc(collection(db, 'books'), bookdata);
        const newBook = { id: docRef.id, ...book };
        commit('addBook', newBook);
      } catch (error) {
        console.error('Failed to create book:', error);
      }
    },
    async updateBook({ commit }, book) {
      try {
        const bookRef = doc(db, 'books', book.id);
        await updateDoc(bookRef, book);
        commit('updateBook', book);
      } catch (error) {
        console.error('Failed to update book:', error);
      }
    },
    async deleteBook({ commit }, bookId) {
      try {
        await deleteDoc(doc(db, 'books', bookId));
        commit('deleteBook', bookId);
      } catch (error) {
        console.error('Failed to delete book:', error);
      }
    },
    async fingerprintLogin({ commit }) {
      try {
        const result = await webAuthnAuthenticate();
        if (result) {
          commit('setUser', { email: 'admin@example.com', isAdmin: true });
          return true;
        }
      } catch (error) {
        console.error('Fingerprint login error:', error);
        return false;
      }
    }
  },
  getters: {
    isAuthenticated(state) {
      return !!state.user;
    },
    currentUser(state) {
      return state.user;
    },
    allBooks(state) {
      return state.books;
    },
    allGenres(state) {
      return state.genres;
    }
  }
});
