import { useState, useRef } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
    apiKey: "AIzaSyB4PaFWvD1seW7bSsDs6FM5TASwFVywb6I",
    authDomain: "chat-380d2.firebaseapp.com",
    projectId: "chat-380d2",
    storageBucket: "chat-380d2.appspot.com",
    messagingSenderId: "811661438506",
    appId: "1:811661438506:web:7de6e5f09db140e8391d53",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
    const [user] = useAuthState(auth);
    return (
        <div className="App">
            <header>
                <h1>Welcome!</h1>
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
    return <button onClick={signInWithGoogle}>Sign In With Google</button>;
}

function SignOut() {
    return (
        auth.currentUser && (
            <button onClick={() => auth.signOut()}>Sign Out</button>
        )
    );
}

function ChatRoom() {
    const messagesEndRef = useRef(null);

    const messagesRef = firestore.collection("messages");
    const query = messagesRef.orderBy("createdAt").limit(25);
    const [messages] = useCollectionData(query, { idField: "id" });
    const [formValue, setFormValue] = useState("");

    const sendMessage = async (e) => {
        e.preventDefault();
        const { uid, photoURL } = auth.currentUser;
        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL,
        });
        setFormValue("");
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <>
            <main>
                {messages &&
                    messages.map((msg, index) => (
                        <ChatMessage key={index} message={msg} />
                    ))}
                <div ref={messagesEndRef}></div>
            </main>
            <form onSubmit={sendMessage}>
                <input
                    type="text"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                />
                <button type="submit">Send</button>
            </form>
        </>
    );
}

function ChatMessage(props) {
    const { text, uid, photoURL, createdAt } = props.message;

    const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

    return (
        <div className={`message ${messageClass}`}>
            <img src={photoURL} alt="pic" />
            <p>{text}</p>
            <p className="time">{createdAt?.toDate().toLocaleString()}</p>
        </div>
    );
}

export default App;
