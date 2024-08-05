import axios from 'axios';
import { auth, db } from '../main';
import { signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

// Fetch all books from Firestore
export const fetchBooks = async () => {
  console.log('fetching books service');
  const querySnapshot = await getDocs(collection(db, 'books'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Create a new book in Firestore
export const createBook = async (book) => {
  console.log(book);
  const bookdata = {
    author: book.author,
    genre: book.genre,
    title: book.title,
    imgURL: book.imgURL,
    year: book.year,
    bookURL: book.bookURL
  };
  const docRef = await addDoc(collection(db, 'books'), bookdata);
  return { id: docRef.id, ...book };
};

// Update an existing book in Firestore
export const updateBook = async (book) => {
  console.log(book);
  const bookdata = {
    author: book.author,
    genre: book.genre,
    title: book.title,
    imgURL: book.imgURL,
    year: book.year,
    bookURL: book.bookURL
  };
  const bookRef = doc(db, 'books', book.id);
  await updateDoc(bookRef, bookdata);
  return book;
};

// Delete a book from Firestore
export const deleteBook = async (bookId) => {
  await deleteDoc(doc(db, 'books', bookId));
  return bookId;
};

// Login function, checking for admin or regular user
export const login = async ({ email, password }) => {
  if (email === ADMIN_EMAIL && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
    return { email, isAdmin: true };
  } else {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { email: userCredential.user.email, uid: userCredential.user.uid };
  }
};

// Register a new user
export const registerUser = async ({ email, password }) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return { email: userCredential.user.email, uid: userCredential.user.uid };
};

// Logout function
export const logout = async () => {
  await signOut(auth);
};

// WebAuthn Registration
export const webAuthnRegister = async (user) => {
  const registrationOptions = await axios.post('http://localhost:3000/generate-registration-options', { email: user.email });
  const attResp = await startRegistration(registrationOptions.data);
  const verification = await axios.post('http://localhost:3000/verify-registration', { email: user.email, attResp });
  return verification.data.success;
};

// WebAuthn Authentication
export const webAuthnAuthenticate = async () => {
  const authOptions = await axios.post('http://localhost:3000/generate-authentication-options', { email: 'admin@example.com' });
  const assertionResp = await startAuthentication(authOptions.data);
  const verification = await axios.post('http://localhost:3000/verify-authentication', { email: 'admin@example.com', assertionResp });
  return verification.data.success;
};

// Chat functionality
export const startChat = async () => {
  // Initialize chat session
  return [];
};

export const sendMessage = async ({ history, message }) => {
  // Logic to interact with a chat service or API
  // This is a placeholder and should be replaced with actual service logic
  const userMessage = { type: 'user', text: message };
  const modelMessage = { type: 'model', text: 'This is a response from the model.' };

  return [...history, userMessage, modelMessage];
};

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('admin123', 10); // Example password hash
