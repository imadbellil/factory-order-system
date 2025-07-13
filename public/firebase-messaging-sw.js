importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAvFQHoCvygnrB26HOdhqhut2y7SD4UNZA",
  authDomain: "factory-order-management-eaa15.firebaseapp.com",
  projectId: "factory-order-management-eaa15",
  storageBucket: "factory-order-management-eaa15.appspot.com",
  messagingSenderId: "696384476027",
  appId: "1:696384476027:web:3239684f8d91b16b87e3de"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/img/logo.webp'
  });
}); 