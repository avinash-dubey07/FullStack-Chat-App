import admin from "firebase-admin";
// import serviceAccount from "./serviceAccountKey.json" assert { type: 'json' }; 
// const serviceAccount = require("./serviceAccountKey.json");
import fs from "fs";
import path from "path";

// Read the JSON file synchronously
const serviceAccount = JSON.parse(
  fs.readFileSync(path.resolve("src/serviceAccountKey.json"), "utf8")
);


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;