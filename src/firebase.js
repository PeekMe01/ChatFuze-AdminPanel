import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Ralph Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCbexBmp1n87jEPtFdUcy03hdTSxEZQ9IU",
  authDomain: "chatfuze-e6658.firebaseapp.com",
  projectId: "chatfuze-e6658",
  storageBucket: "chatfuze-e6658.appspot.com",
  messagingSenderId: "272135652991",
  appId: "1:272135652991:web:362cedd001478f4356614a",
  measurementId: "G-3Q29BMQ5X0",
  databaseURL: "https://chatfuze-e6658-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
