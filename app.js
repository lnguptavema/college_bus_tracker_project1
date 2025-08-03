// Import Firebase SDK modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const checkIns = collection(db, "checkins");

// Define your custom stop names
const stops = [
  { id: 1, name: "Badrirajupalem" },
  { id: 2, name: "Thotlavaluru" },
  { id: 3, name: "Godavarru" },
  { id: 4, name: "Kankipadu" },
  { id: 5, name: "Gosala" },
  { id: 6, name: "Ganguru" },
  { id: 7, name: "Penamaluru" },
  { id: 8, name: "Poranki" },
  { id: 9, name: "Tadigadapa" },
  { id: 10, name: "Enikepadu" },
  { id: 11, name: "Prasadampadu" },
  { id: 12, name: "Ramavarapadu" },
  { id: 13, name: "Nunna" }
];

// Populate dropdown with stop names
const stopSelect = document.getElementById("stopSelect");
stops.forEach(s => {
  const opt = document.createElement("option");
  opt.value = s.id;
  opt.textContent = s.name;
  stopSelect.append(opt);
});

// Handle check-in button click
document.getElementById("checkInBtn").addEventListener("click", async () => {
  const stopId = Number(stopSelect.value);
  const stopName = stops.find(s => s.id === stopId)?.name;

  if (!stopName) return;

  await addDoc(checkIns, {
    stopId,
    stopName,
    timestamp: serverTimestamp()
  });
});

// Auto-delete old check-ins (not from today)
async function deleteOldCheckins() {
  try {
    const snapshot = await getDocs(checkIns);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    snapshot.forEach(async (docSnap) => {
      const data = docSnap.data();
      const timestamp = data.timestamp?.toDate();
      if (!timestamp) return;

      timestamp.setHours(0, 0, 0, 0);
      if (timestamp.getTime() !== today.getTime()) {
        await deleteDoc(doc(db, "checkins", docSnap.id));
      }
    });
  } catch (err) {
    console.error("Error deleting old check-ins:", err);
  }
}

// Run cleanup when page loads
window.addEventListener("load", () => {
  deleteOldCheckins();
});

// Real-time log display
const logEl = document.getElementById("log");
const q = query(checkIns, orderBy("timestamp", "desc"));

onSnapshot(q, snapshot => {
  logEl.innerHTML = "";
  snapshot.forEach(doc => {
    const { stopName, timestamp } = doc.data();
    const ts = timestamp?.toDate().toLocaleTimeString() || "…";
    const li = document.createElement("li");
    li.textContent = `${stopName} : ${ts}`;
    logEl.append(li);
  });
});
