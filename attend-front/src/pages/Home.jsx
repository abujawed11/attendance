import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="min-h-[80vh] flex flex-col justify-center items-center text-center px-4">
      <h1 className="text-3xl sm:text-5xl font-bold text-indigo-700 mb-4">
        Welcome to CampusFlow
      </h1>
      <p className="text-gray-600 max-w-md">
        Manage attendance, marks, and insights with a modern, mobile-first experience.
      </p>
      <Link
        to="/signup"
        className="mt-6 inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
      >
        Get Started
      </Link>
    </section>
  );
}
