import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import "./App.css";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="text-center text-sm text-gray-500 py-4 border-t mt-auto">
        © {new Date().getFullYear()} CampusFlow. All rights reserved.
      </footer>
    </div>
  );
}
