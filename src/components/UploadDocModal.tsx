import { FiUpload } from "react-icons/fi";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { PiPlusBold } from "react-icons/pi";
import { toast } from "react-toastify";
import { useState } from "react";
import { useRouter } from "next/navigation";

export const ALLOWED_MIME_TYPES = [
  { type: "text/plain", label: "TXT" },
  { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", label: "DOCX" },
  { type: "text/html", label: "HTML" },
  { type: "application/json", label: "JSON" },
];

export default function UploadModal({ onClose, userId }: { onClose: () => void, userId?: string }) {
  const [loading, setLoading] = useState(false);

  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState(ALLOWED_MIME_TYPES[0].type);
  const router = useRouter();

  const handleCreateBlankDocument = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/google/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: docName, mimeType: docType, userId }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Document created: ${data.document.googleId}`);
        onClose();
        router.push(`/editor?fileId=${data.document.googleId}`);
      } else {
        const errorData = await response.json();
        toast.error(`Error creating document: ${errorData.error}`);
      }
    } catch (error) {
      toast.error("An error occurred while creating the document." + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLoading(true);

    if (!file) {
      toast.error("No file selected.");
      setLoading(false);
      return;
    }

    if (!ALLOWED_MIME_TYPES.some(({ type }) => type === file.type)) {
      toast.error("Unsupported file type. Supported formats: TXT, DOCX, JSON, HTML.");
      setLoading(false);
      return;
    }
    

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds the limit of 10MB.");
      setLoading(false);
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64File = reader.result?.toString().split(",")[1];

        const response = await fetch("/api/google/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type,
            content: base64File,
            userId,
          }),
        });
        setLoading(false);
        onClose();
        if (response.ok) {
          const data = await response.json();
          toast.success(`File uploaded successfully! ${data.fileName}`);
        } else {
          const errorData = await response.json();
          toast.error(`Error uploading file: ${errorData.error}`);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("An error occurred while uploading the file.");
    }

  };

  return (
    <>
    {!isSecondModalOpen ? (
      <div className="bg-white rounded-lg shadow-lg p-6 w-[48rem]">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Select document</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <AiOutlineCloseCircle size={24} />
          </button>
        </div>
        <p className="text-gray-500 mb-4">Import your documents</p>
        {loading ? 
          <div className="mt-4 flex items-center justify-center">
            <div className="loader w-6 h-6 border-4 border-t-transparent border-green-500 rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-500">Uploading...</span>
          </div>
        :
        <div className="flex gap-10">
          {/* Drag and Drop Section */}
          <label className="w-2/3 h-44 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-3 p-4 hover:shadow-lg cursor-pointer">
            <p className="text-gray-500">Drag and drop your file (txt, json, docx, html)</p>
            <div className="mt-2 text-green-500 font-semibold flex gap-2 text-lg">
              <FiUpload size={24} className="mb-2" /> Select File
            </div>
            <input className="hidden" type="file" onChange={handleFileUpload} />
          </label>

          {/* Create Blank Section */}
          <div className="w-1/3 h-44 border rounded-lg flex flex-col items-center justify-center gap-3 p-4 hover:shadow-lg cursor-pointer"
            onClick={() => setIsSecondModalOpen(true)}
          >
            <p className="text-gray-500">Create Blank</p>
            <PiPlusBold size={32} className="text-green-500" />
          </div>
        </div>
        }
    </div>): (
      <div className="bg-white rounded-lg shadow-lg p-6 w-[28rem]">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Create New Document</h2>
          <button onClick={() => setIsSecondModalOpen(false)} className="text-gray-500 hover:text-red-500">
            <AiOutlineCloseCircle size={24} />
          </button>
        </div>
        <div className="mt-4">
          <label className="block text-gray-700">Document Name</label>
          <input
            type="text"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            className="w-full border p-2 rounded mt-1"
            placeholder="Enter document name"
          />
        </div>
        <div className="mt-4">
          <label className="block text-gray-700">Select Type</label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          >
            {ALLOWED_MIME_TYPES.map(({ type, label }) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleCreateBlankDocument}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    )}
    </>
  );
}
