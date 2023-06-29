import React, { useState, useEffect } from 'react';
import * as firebase from "firebase/app";
import { getFirestore, doc, setDoc, addDoc, collection } from "firebase/firestore";
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, User, signOut, getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyA6Ma5bKwBZ5aT88Osg3OjaOnfXfJGek8E",
  authDomain: "wattson-e0433.firebaseapp.com",
  projectId: "wattson-e0433",
  storageBucket: "wattson-e0433.appspot.com",
  messagingSenderId: "231647018208",
  appId: "1:231647018208:web:3505c53385d873e1882485",
  measurementId: "G-0QS9ZW8S6P"
};
const app = firebase.initializeApp(firebaseConfig);
export const auth = getAuth(app);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [errrorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [batteryCapacity, setBatteryCapacity] = useState<number>(0);
  const [chargingAmount, setChargingAmount] = useState<number>(0);

  useEffect(() => {
    // Check if the user is already logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      setUser(null);
    });
  };

  const handleBatteryLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (value < 1) return false;
    if (value > 100) return false;
    setBatteryLevel(value);
    updateChargingAmount(value, batteryCapacity);
  };

  const handleBatteryCapacityChange = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const value = event.target.value;
    setBatteryCapacity(value);
    updateChargingAmount(batteryLevel, value);
  };

  const updateChargingAmount = (level: number, capacity: number) => {
    const parsedLevel = level;
    const parsedCapacity = capacity;
    if (!isNaN(parsedLevel) && !isNaN(parsedCapacity)) {
      setChargingAmount(parsedCapacity - (parsedCapacity / 100 * parsedLevel));
    } else {
      setChargingAmount(0);
    }
  };

  const handleSubmit = async () => {
    const payload = {
      batteryLevel,
      batteryCapacity,
      chargingAmount,
      userId: user?.uid,
    };
    const db = getFirestore(app);
    const confirmation = await addDoc(collection(db, "charging"), {
      batteryCapacity,
      chargingAmount,
      userId: user?.uid,
    }).catch(error => {
      setErrorMessage('Problem att skicka in data')
    });
    if (confirmation) setConfirmationMessage('Inskickat!')
  };
  const clearConfirmationMessage = () => setConfirmationMessage('')

  return (
    <div className="main">
      {user ? (
        <div>
          <h1><small> Welcome</small> <br /> {user.displayName}</h1>
          {errrorMessage && <div className="message--error message">
            Det är problem att skicka in dina uppgifter just nu. Försök senare eller kontakta support.
            <button onClick={() => setErrorMessage(null)}>Ok.</button>
          </div>}
          {confirmationMessage && <div className="message--confirmation message">
            Dina uppgifter är registrerade
            <button onClick={clearConfirmationMessage}>Ok! Toppen.</button>
          </div>}
          <div>
            <label>Battery Level before charge (%): </label>
            <input type="number" min="0" max="100" value={batteryLevel} onChange={handleBatteryLevelChange} />
          </div>
          <div>
            <label>Battery Capacity (kW): </label>
            <select value={batteryCapacity} onChange={handleBatteryCapacityChange}>
              <option value="">Select Capacity</option>
              <option value="32">32 kW</option>
              <option value="64">64 kW</option>
              {/* TODO: Make it optional */}
              {/* <option value="custom">Custom</option> */}
            </select>
            {/* {batteryCapacity === 'custom' && (
              <input type="text" value="0" onChange={handleBatteryCapacityChange} />
            )} */}
          </div>
          {!!batteryCapacity && batteryLevel && <div className="note">Charging Amount: {chargingAmount.toFixed(2)} kW ({(chargingAmount * 1.99).toFixed(2)} SEK)</div>}
          <div className='button-group'>
            <button onClick={handleSubmit} disabled={!batteryCapacity || !batteryLevel}>Send in 🚀</button>
            <button onClick={handleLogout} className='secondary'>Logout 👋🏻</button>
          </div>
          <div className="align-center">
            <button className='settings-button'>Inställningar</button>
          </div>
        </div>
      ) : (
        <div>
          <h1>Logga in till Wattson! 🎩</h1>
          <button onClick={handleLogin}>Login with Google</button>
        </div>
      )}
    </div>
  );
};

export default App;
