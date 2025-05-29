import { FiDownload } from "react-icons/fi";
import { FaRegTrashAlt } from "react-icons/fa";
import { IoEyeSharp, IoPersonAddSharp } from "react-icons/io5";
import { Button } from "./ui/button";
import { toast } from "react-toastify";
import { useState } from "react";
import ShareFileModal from "./ShareFileModal";
import ModalWrapper from "./ModalWrapper";

export default function MediaDocumentCard({
  index,
  file,
  userId,
  onDelete,
}: {
  index: number;
  file: Record<string, string>;
  userId: string;
  onDelete: (fileId: string) => void;
}) {
  const [shareFileModalOpen, setShareFileModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const userOwnerId = file.userOwnerId || userId;

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/google/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId: file.id }),
      });

      if (response.ok) {
        const { downloadUrl } = await response.json();
        window.open(downloadUrl, "_self");
      } else {
        console.error("Failed to get download link");
      }
    } catch (error) {
      console.error("Error downloading file:", (error as Error).message);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/google/deletefile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId: file.id }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data?.message);
        onDelete(file.id);
      } else {
        toast.error(data?.error);
      }
    } catch (error) {
      console.error("Error deleting file:", (error as Error).message);
    }
  };

  return (
    <>
      {index !== 0 && (<div className="h-[1px] bg-gray-400"/>)}
      
      {/* Share Modal */}
      <ModalWrapper isOpen={shareFileModalOpen} onClose={() => setShareFileModalOpen(false)}>
        <ShareFileModal
          userId={userId}
          onClose={() => setShareFileModalOpen(false)}
          documentId={file.id}
        />
      </ModalWrapper>

      {/* Preview Modal */}
      <ModalWrapper isOpen={previewModalOpen} onClose={() => setPreviewModalOpen(false)}>
        <div className="w-[90vw] md:w-[80vw] h-[80vh] p-4 bg-white rounded shadow-lg">
          <iframe
            src={`https://drive.google.com/file/d/${file.id}/preview`}
            width="100%"
            height="100%"
            allow="autoplay"
            className="border rounded"
          />
        </div>
      </ModalWrapper>

      {/* Desktop версія */}
      <div className="hidden lg:flex w-full justify-between items-center p-4">
        <div className="w-1/5 text-center cursor-pointer hover:text-blue-600 transition-colors truncate px-2" onClick={() => setPreviewModalOpen(true)}>
          {file.name}
        </div>
        <div className="w-1/5 text-center truncate px-2">{file.userOwnerEmail}</div>
        <div className="w-1/5 text-center text-sm px-2">
          {new Date(file.createdTime).toLocaleDateString() +
            " " +
            new Date(file.createdTime).toLocaleTimeString()}
        </div>
        <div className="w-1/5 text-center text-sm px-2">
          {new Date().getTime() - new Date(file.modifiedTime).getTime() < 86400000
            ? "Today"
            : new Date(file.modifiedTime).toLocaleDateString() +
              " " +
              new Date(file.modifiedTime).toLocaleTimeString()}
        </div>
        <div className="w-1/5 text-center flex justify-center gap-2">
          <Button variant="fileAction" size="fileAction" onClick={handleDownload}>
            <FiDownload size={24} />
          </Button>
          {userOwnerId === userId && (
            <Button
              variant="fileAction"
              size="none"
              className="h-6"
              onClick={() => setShareFileModalOpen(true)}
            >
              <IoPersonAddSharp size={24} />
            </Button>
          )}
          <Button variant="fileAction" size="fileAction" onClick={() => setPreviewModalOpen(true)}>
            <IoEyeSharp size={24} />
          </Button>
          {userOwnerId === userId && (
            <Button className="hover:text-red-500" variant="fileAction" size="fileAction" onClick={handleDelete}>
              <FaRegTrashAlt size={24} />
            </Button>
          )}
        </div>
      </div>

      {/* Tablet версія */}
      <div className="hidden md:flex lg:hidden w-full flex-col p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div 
              className="font-medium text-lg truncate pr-4 cursor-pointer hover:text-blue-600 transition-colors" 
              onClick={() => setPreviewModalOpen(true)}
            >
              {file.name}
            </div>
            <div className="text-sm text-gray-600 truncate">{file.userOwnerEmail}</div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="fileAction" size="fileAction" onClick={handleDownload}>
              <FiDownload size={20} />
            </Button>
            {userOwnerId === userId && (
              <Button
                variant="fileAction"
                size="none"
                className="h-6"
                onClick={() => setShareFileModalOpen(true)}
              >
                <IoPersonAddSharp size={20} />
              </Button>
            )}
            <Button variant="fileAction" size="fileAction" onClick={() => setPreviewModalOpen(true)}>
              <IoEyeSharp size={20} />
            </Button>
            {userOwnerId === userId && (
              <Button className="hover:text-red-500" variant="fileAction" size="fileAction" onClick={handleDelete}>
                <FaRegTrashAlt size={20} />
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-500">
          <div>Created At: {new Date(file.createdTime).toLocaleDateString()}</div>
          <div>Last Modified: {
            new Date().getTime() - new Date(file.modifiedTime).getTime() < 86400000
              ? "Сьогодні"
              : new Date(file.modifiedTime).toLocaleDateString()
          }</div>
        </div>
      </div>

      {/* Mobile версія */}
      <div className="flex md:hidden w-full flex-col p-4 space-y-3">
        <div className="flex flex-col space-y-2">
          <div 
            className="font-medium text-lg break-words cursor-pointer hover:text-blue-600 transition-colors active:text-blue-800" 
            onClick={() => setPreviewModalOpen(true)}
          >
            {file.name}
          </div>
          <div className="text-sm text-gray-600 break-words">{file.userOwnerEmail}</div>
        </div>
        
        <div className="flex flex-col space-y-1 text-sm text-gray-500">
          <div>Created At: {new Date(file.createdTime).toLocaleDateString()}</div>
          <div>Last Modified: {
            new Date().getTime() - new Date(file.modifiedTime).getTime() < 86400000
              ? "Сьогодні"
              : new Date(file.modifiedTime).toLocaleDateString()
          }</div>
        </div>
        
        <div className="flex justify-center gap-3 pt-2">
          <Button variant="fileAction" size="fileAction" onClick={handleDownload}>
            <FiDownload size={20} />
          </Button>
          {userOwnerId === userId && (
            <Button
              variant="fileAction"
              size="none"
              className="h-6"
              onClick={() => setShareFileModalOpen(true)}
            >
              <IoPersonAddSharp size={20} />
            </Button>
          )}
          <Button variant="fileAction" size="fileAction" onClick={() => setPreviewModalOpen(true)}>
            <IoEyeSharp size={20} />
          </Button>
          {userOwnerId === userId && (
            <Button className="hover:text-red-500" variant="fileAction" size="fileAction" onClick={handleDelete}>
              <FaRegTrashAlt size={20} />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}