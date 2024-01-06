import React, { useRef, useState } from "react";
import "./App.css";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore"; //databse
import "firebase/compat/auth"; //user authentication

//hooks
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyCXw519wPjdX3apmo7rztuP4hczhbdu4yQ",
  authDomain: "superchat-3c8a0.firebaseapp.com",
  projectId: "superchat-3c8a0",
  storageBucket: "superchat-3c8a0.appspot.com",
  messagingSenderId: "562617407022",
  appId: "1:562617407022:web:3738934ca09c0cc06071bf",
  measurementId: "G-16BYZ0YK6T",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  /*
  if user is logged in, useAuthState returns an object with userID,
  email, etc

  if user is logged out, useAuthState returns null
  */
  const [user] = useAuthState(auth);

  //ternary operator lets us show chat room if user is signed in
  return (
    <div className="App">
      <header>
        <h1>Superchat</h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <button className="sign-in" onClick={signInWithGoogle}>
      Sign in with Google
    </button>
  );
}

function SignOut() {
  //if current user we return button
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  //dummy for auto-scroll
  const dummy = useRef();

  //reference to collection
  const messagesRef = firestore.collection("messages");

  //subset of collection
  const query = messagesRef.orderBy("createdAt").limit(25);

  //array of messages
  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    //prevent page from refreshing upon message sent
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    //add message to database
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    //scroll to bottom after message sent
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  //if current user sent message, message gets 'sent' styling class
  //otherwise it gets 'received'
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  );
}

export default App;
