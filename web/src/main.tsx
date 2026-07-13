import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import axios from 'axios';

// ✅ Global Axios Config
axios.defaults.baseURL = 'http://127.0.0.1:8000/api';
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

createRoot(document.getElementById("root")!).render(<App />);
  