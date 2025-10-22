import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Signup from "./pages/Signup.jsx";

// simple placeholder so your /about link doesn't 404
function About() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-semibold mb-2">About</h2>
      <p className="text-gray-600">
        This is a placeholder About page. Replace with your content anytime.
      </p>
    </section>
  );
}

const router = createBrowserRouter([
  {
    element: <App />, // layout shell
    children: [
      { path: "/", element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/signup", element: <Signup /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
