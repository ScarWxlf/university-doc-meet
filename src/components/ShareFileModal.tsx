import { useState } from "react";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { toast } from "react-toastify";
import { emailSchema } from "@/lib/validator";
import { z } from "zod";

export default function ShareFileModal({ onClose, documentId, userId }: { onClose: () => void; documentId: string; userId: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!email) {
      toast.error("Please enter an email address.");
      return;
    }
    
    try {
        setLoading(true);
        emailSchema.parse({ email });
      const response = await fetch("/api/google/sharefile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: documentId,
          userSharedEmail: email,
          userId,
        }),
      });

      if (response.ok) {
        toast.success("Document shared successfully!");
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(`Error sharing document: ${errorData.error}`);
      }
    } catch (error) {
        if (error instanceof z.ZodError) {
            const fieldErrors = error.flatten().fieldErrors;
            toast.error(fieldErrors.email![0]);
        }else{
            toast.error("An error occurred while sharing the document." + (error as Error).message);
        }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="bg-white rounded-lg shadow-lg p-6 w-[448px] max-w-md">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Share Document</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <AiOutlineCloseCircle size={24} />
          </button>
        </div>
        <div className="mt-4">
          <label className="block text-gray-700 font-medium mb-2">User Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter user email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-green-200"
          />
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleShare}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white ${loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"} transition`}
          >
            {loading ? "Sharing..." : "Share"}
          </button>
        </div>
      </div>
  );
}
