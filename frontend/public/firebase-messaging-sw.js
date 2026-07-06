// Scripts for firebase-messaging-sw
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyC9IGreaTSma8EKzr80HBoTT1UI1UfTMWE",
  authDomain: "spike-24eed.firebaseapp.com",
  projectId: "spike-24eed",
  storageBucket: "spike-24eed.firebasestorage.app",
  messagingSenderId: "659081292797",
  appId: "1:659081292797:web:4378a440ca96ea8146c794",
  measurementId: "G-J9BTWRQ43Y"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);
  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have received a new message.',
    icon: payload.notification?.image || '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
