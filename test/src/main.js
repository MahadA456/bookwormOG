import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import './assets/main.css';
import 'sweetalert2/dist/sweetalert2.min.css'; // Import SweetAlert2 CSS

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbfJt9Po1C1j9C8F_D08zJhy4-v5SzDKw",
  authDomain: "bookwormog-41351.firebaseapp.com",
  projectId: "bookwormog-41351",
  storageBucket: "bookwormog-41351.appspot.com",
  messagingSenderId: "11176025974",
  appId: "1:11176025974:web:c4197108a4346a16ee2457",
  measurementId: "G-W7BND35K47"
};
// Initialize Firebase
const appFirebase = initializeApp(firebaseConfig);
export const auth = getAuth(appFirebase); // Export the auth instance
export const db = getFirestore(appFirebase); // Export the Firestore instance

const app = createApp(App);
app.use(router);
app.use(store);
app.mount('#app');
