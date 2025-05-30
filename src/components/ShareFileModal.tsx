import { useState } from "react";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { toast } from "react-toastify";
import { emailSchema } from "@/lib/validator";
import { z } from "zod";
import { useSession } from "next-auth/react";

type EmailEntry = {
email: string;
permission: "VIEW" | "EDIT";
};

export default function ShareFileModal({ onClose, documentId, userId }: { onClose: () => void; documentId: string; userId: string }) {
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<EmailEntry[]>([]);
  const [inputValue, setInputValue] = useState("");
  const {data: session} = useSession();

  const handleAddEmail = async () => {
    const email = inputValue.trim();
    if (!email) return;
  
    try {
      emailSchema.parse({ email });
      if(session?.user?.email === email) {
        toast.error("You cannot share the document with yourself.");
        return;
      }
  
      const res = await fetch("/api/user/check-exists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      const data = await res.json();
  
      if (!res.ok || !data.exists) {
        toast.error("User with this email does not exist.");
        return;
      }
  
      if (!emails.find(e => e.email === email)) {
        setEmails([...emails, { email, permission: "EDIT" }]);
        setInputValue("");
      } else {
        toast.info("Email already added.");
      }
  
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error("Invalid email format.");
      } else {
        toast.error("Error checking user.");
      }
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email.email !== emailToRemove));
  };

  const handleShare = async () => {
    if (emails.length === 0) {
      toast.error("Please add at least one valid email.");
      return;
    }
  
    try {
      setLoading(true);
      const response = await fetch("/api/google/sharefile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: documentId,
          emails,
          userId,
        }),
      });
  
      if (response.ok) {
        toast.success("Document shared successfully!");
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error}`);
      }
    } catch (error) {
      toast.error("Error: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="bg-white rounded-lg shadow-lg p-6 w-[85%] sm:w-[448px] max-w-md">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Share Document</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <AiOutlineCloseCircle size={24} />
          </button>
        </div>
        <div className="mt-4">
          <label className="block text-gray-700 font-medium mb-2">User Email</label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
            placeholder="Enter email and press Enter"
            className="w-full border rounded-lg px-3 py-2"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {emails.map(({ email, permission }) => (
              <div key={email} className="bg-gray-200 px-2 py-1 rounded-full flex items-center gap-2">
                <span>{email}</span>
                <select
                  className="text-sm bg-white border rounded px-1 py-0.5"
                  value={permission}
                  onChange={(e) =>
                    setEmails((prev) =>
                      prev.map((entry) =>
                        entry.email === email ? { ...entry, permission: e.target.value as "VIEW" | "EDIT" } : entry
                      )
                    )
                  }
                >
                  <option value="VIEW">View</option>
                  <option value="EDIT">Edit</option>
                </select>
                <button onClick={() => handleRemoveEmail(email)} className="text-red-500">×</button>
              </div>
            ))}
          </div>
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