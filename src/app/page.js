"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    budgetMin: "",
    budgetMax: "",
    deadline: "",
    buyerId: "68552fdaf87dc067fe24273c", // ✅ Corrected buyer ID
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  fetchProjects();
}, []);

const fetchProjects = async () => {
  setLoading(true);
  const res = await fetch("http://localhost:5000/api/projects");
  const data = await res.json();
  // Filter duplicates based on id
  const uniqueProjects = data.filter((project, index, self) =>
    index === self.findIndex((p) => p.id === project.id)
  );
  setProjects(uniqueProjects);
  setLoading(false);
};

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      fetchProjects();
      setForm({
        title: "",
        description: "",
        budgetMin: "",
        budgetMax: "",
        deadline: "",
        buyerId: "68552fdaf87dc067fe24273c", // keep after reset
      });
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Project</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full p-2 border"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full p-2 border"
        />
        <input
          name="budgetMin"
          type="number"
          value={form.budgetMin}
          onChange={handleChange}
          placeholder="Budget Min"
          className="w-full p-2 border"
        />
        <input
          name="budgetMax"
          type="number"
          value={form.budgetMax}
          onChange={handleChange}
          placeholder="Budget Max"
          className="w-full p-2 border"
        />
        <input
          name="deadline"
          type="date"
          value={form.deadline}
          onChange={handleChange}
          className="w-full p-2 border"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {loading ? "Creating..." : "Create Project"}
        </button>
      </form>

      <h1 className="text-2xl font-bold mt-8 mb-4">Projects</h1>
      {loading ? (
        <p>Loading...</p>
      ) : projects.length ? (
        <ul>
          {projects.map((project) => (
            <li key={project.id} className="mb-2">
              <a href={`/projects/${project.id}`} className="text-blue-500">
                {project.title}
              </a>{" "}
              (Status: {project.status})
            </li>
          ))}
        </ul>
      ) : (
        <p>No projects found.</p>
      )}
    </div>
  );
}
