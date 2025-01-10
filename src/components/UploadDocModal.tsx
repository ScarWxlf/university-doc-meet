import { FiUpload } from "react-icons/fi";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { PiPlusBold } from "react-icons/pi";
import { FormEvent } from "react"

export default function UploadModal({ onClose }: { onClose: () => void }) {
  const handleFileUpload = async (e) => {
    console.log(e.currentTarget.files[0]);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Select document</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <AiOutlineCloseCircle size={24} />
          </button>
        </div>
        <p className="text-gray-500 mb-4">import your documents</p>
        <div className="flex gap-10">
          {/* Drag and Drop Section */}
          <label className="w-2/4 h-44 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-3 p-4 hover:shadow-lg cursor-pointer">
            <p className="text-gray-500">Drag and drop your file</p>
            <div className="mt-2 text-green-500 font-semibold flex gap-2 text-lg"><FiUpload size={24} className="mb-2" /> Select File</div>
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
      </div>
    </div>
  );
}
