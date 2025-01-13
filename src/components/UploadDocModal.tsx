import { FiUpload } from "react-icons/fi";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { PiPlusBold } from "react-icons/pi";
import { toast } from "react-toastify";
import { useState } from "react";

const ALLOWED_MIME_TYPES = [
  "text/plain", // TXT
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "text/html", // HTML
  "application/json", // JSON
];

export default function UploadModal({ onClose, userId }: { onClose: () => void, userId: string }) {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLoading(true);

    if (!file) {
      toast.error("No file selected.");
      setLoading(false);
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error("Unsupported file type. Supported formats: TXT, PDF, DOCX, RTF, HTML.");
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
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
          <label className="w-2/4 h-44 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-3 p-4 hover:shadow-lg cursor-pointer">
            <p className="text-gray-500">Drag and drop your file</p>
            <div className="mt-2 text-green-500 font-semibold flex gap-2 text-lg">
              <FiUpload size={24} className="mb-2" /> Select File
            </div>
            <input className="hidden" type="file" onChange={handleFileUpload} />
          </label>

          {/* Create Blank Section */}
          <div className="w-1/4 h-44 border rounded-lg flex flex-col items-center justify-center gap-3 p-4 hover:shadow-lg cursor-pointer">
            <p className="text-gray-500">Create Blank</p>
            <PiPlusBold size={32} className="text-green-500" />
          </div>

          {/* Select a Template Section */}
          <div className="w-1/4 h-44 border rounded-lg flex flex-col items-center justify-center gap-3 p-4 hover:shadow-lg cursor-pointer">
            <p className="text-gray-500">Select a Template</p>
            <FiUpload size={32} className="text-green-500" />
          </div>
        </div>
        }
      </div>
    </div>
  );
}
