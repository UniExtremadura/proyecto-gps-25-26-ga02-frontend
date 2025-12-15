import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home.jsx";
import NovaTune from "./pages/NovaTune.jsx";
import Register from "./pages/Register.jsx";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<NovaTune />} />
                <Route path="/home" element={<Home />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </Router>
    );
}