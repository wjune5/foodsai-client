import { HUGGINGFACE_API_KEY } from "../constants/config";

// function handleCommand(commandText: string) {
//     const parsed = parseCommand(commandText);

//     const request = indexedDB.open("VoiceDB", 1);

//     request.onupgradeneeded = (event) => {
//       const db = request.result;
//       if (!db.objectStoreNames.contains("items")) {
//         db.createObjectStore("items", { keyPath: "item" });
//       }
//     };

//     request.onsuccess = () => {
//       const db = request.result;
//       const tx = db.transaction("items", "readwrite");
//       const store = tx.objectStore("items");

//       if (parsed.action === "add" && parsed.quantity) {
//         store.put({ item: parsed.item, quantity: parsed.quantity });
//       } else if (parsed.action === "delete") {
//         store.delete(parsed.item);
//       } else {
//         console.warn("Unknown or unsupported command");
//       }

//       tx.oncomplete = () => console.log("Transaction complete");
//     };
//   }


