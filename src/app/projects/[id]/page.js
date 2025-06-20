"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function ProjectDetails() {
  const params = useParams();
  const id = params?.id;

  const [project, setProject] = useState(null);
  const [bidForm, setBidForm] = useState({
    amount: "",
    estimatedTime: "",
    message: "",
  });
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    const res = await fetch(`http://localhost:5000/api/projects/${id}`);
    const data = await res.json();
    setProject(data);
    setLoading(false);
  };

  const handleBidChange = (e) => {
    setBidForm({ ...bidForm, [e.target.name]: e.target.value });
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/bids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: id,
        sellerId: "68552fdaf87dc067fe24273d", 
        ...bidForm,
      }),
    });
    if (res.ok) fetchProject();
    setLoading(false);
  };

  const handleSelectBid = async (bidId) => {
    setLoading(true);
    const res = await fetch(`http://localhost:5000/api/projects/${id}/select-bid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bidId }),
    });
    if (res.ok) fetchProject();
    setLoading(false);
  };

  const handleDeliverableSubmit = async (e) => {
    e.preventDefault();

    if (!deliverableUrl.trim()) {
      alert("Please enter a valid file URL before submitting.");
      return;
    }

    setLoading(true);

    const res = await fetch(`http://localhost:5000/api/projects/${id}/deliverables`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl: deliverableUrl }),
    });

    if (res.ok) {
      alert("✅ Deliverable uploaded successfully!");
      setDeliverableUrl("");
      fetchProject();
    } else {
      alert("❌ Failed to upload deliverable.");
    }

    setLoading(false);
  };

const handleComplete = async () => {
  const confirmComplete = window.confirm("Are you sure you want to mark this project as completed?");
  if (!confirmComplete) return;

  setLoading(true);

  try {
    const res = await fetch(`http://localhost:5000/api/projects/${id}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Project marked as completed and notifications sent.");

      
      setProject((prev) => ({ ...prev, status: "Completed" }));
    } else {
      alert(`❌ Failed to mark project as completed. Reason: ${data.error || "Unknown error"}`);
    }
  } catch (error) {
    console.error("❌ Error:", error);
    alert("❌ Something went wrong while marking the project as completed.");
  }

  setLoading(false);
};


  if (loading && !project) return <p>Loading...</p>;
  if (!project) return <p>Project not found.</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{project.title}</h1>
      <p><strong>Description:</strong> {project.description}</p>
      <p><strong>Budget:</strong> ${project.budgetMin} - ${project.budgetMax}</p>
      <p><strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}</p>
      <p><strong>Status:</strong> {project.status}</p>

      <h2 className="text-xl font-bold mt-4 mb-2">Bids</h2>
      {project.bids.length ? (
        <ul>
          {project.bids.map((bid) => (
            <li key={bid.id} className="mb-2">
              ${bid.amount} by {bid.seller?.name || "Unknown"} - {bid.estimatedTime}
              {project.selectedBidId !== bid.id && (
                <button
                  onClick={() => handleSelectBid(bid.id)}
                  className="ml-2 px-2 py-1 bg-green-500 text-white rounded"
                >
                  Select
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No bids yet.</p>
      )}

      <h2 className="text-xl font-bold mt-4 mb-2">Place Bid</h2>
      <form onSubmit={handleBidSubmit} className="space-y-4">
        <input
          name="amount"
          value={bidForm.amount}
          onChange={handleBidChange}
          placeholder="Amount"
          type="number"
          className="w-full p-2 border"
        />
        <input
          name="estimatedTime"
          value={bidForm.estimatedTime}
          onChange={handleBidChange}
          placeholder="Estimated Time"
          className="w-full p-2 border"
        />
        <input
          name="message"
          value={bidForm.message}
          onChange={handleBidChange}
          placeholder="Message"
          className="w-full p-2 border"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {loading ? "Submitting..." : "Place Bid"}
        </button>
      </form>

      <h2 className="text-xl font-bold mt-4 mb-2">Upload Deliverable</h2>
      <form onSubmit={handleDeliverableSubmit} className="space-y-4">
        <input
          value={deliverableUrl}
          onChange={(e) => setDeliverableUrl(e.target.value)}
          placeholder="File URL"
          className="w-full p-2 border"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {loading ? "Uploading..." : "Upload Deliverable"}
        </button>
      </form>

      {}
      {project.status !== "Completed" && !project.deliverables?.length && (
        <button
          onClick={handleComplete}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
        >
          {loading ? "Completing..." : "Mark as Completed"}
        </button>
      )}

      {}
      {project.deliverables?.length > 0 && project.status !== "Completed" && (
        <p className="mt-4 text-green-600">
          ✅ Deliverable uploaded. Waiting for buyer to mark as complete.
        </p>
      )}

      {}
      {project.status === "Completed" && (
        <p className="mt-4 text-blue-600 font-semibold">✅ Project marked as completed!</p>
      )}
    </div>
  );
}
