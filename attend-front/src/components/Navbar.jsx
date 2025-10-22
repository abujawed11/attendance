import { useState } from "react";
import { NavLink, Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkBase = "px-3 py-2 rounded-md text-sm font-medium";
  const linkClasses = ({ isActive }) =>
    `${linkBase} ${isActive ? "text-white bg-indigo-600" : "text-gray-700 hover:bg-indigo-50"}`;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-700">
          CampusFlow
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <NavLink to="/" className={linkClasses}>Home</NavLink>
          <NavLink to="/about" className={linkClasses}>About</NavLink>
          <NavLink to="/signup" className={linkClasses}>Signup</NavLink>
        </div>

        {/* Mobile button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-gray-700 focus:outline-none"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <NavLink to="/" className={linkClasses} onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/about" className={linkClasses} onClick={() => setOpen(false)}>About</NavLink>
          <NavLink to="/signup" className={linkClasses} onClick={() => setOpen(false)}>Signup</NavLink>
        </div>
      )}
    </nav>
  );
}
