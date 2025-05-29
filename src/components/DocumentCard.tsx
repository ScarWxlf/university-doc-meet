import { FiDownload } from "react-icons/fi";
import { MdEdit } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { Button } from "./ui/button";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { IoPersonAddSharp } from "react-icons/io5";
import { useState } from "react";
import ShareFileModal from "./ShareFileModal";
import ModalWrapper from "./ModalWrapper";

export default function DocumentCard({ index, file, userId, onDelete }: { index: number, file: Record<string, string>, userId: string, onDelete: (fileId: string) => void }) {
    const [shareFileModalOpen, setShareFileModalOpen] = useState(false);
    const userOwnerId = file.userOwnerId || userId;
    const router = useRouter();
    
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

      const handleEdit = () => {
        router.push(`/editor?fileId=${file.id}`);
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
          if(response.ok){
            toast.success(data?.message);
            onDelete(file.id);
          } else {
            toast.error(data?.error);
          }
        } catch (error) {
          console.error("Error deleting file:", (error as Error).message);
        }
      }

    return (
        <>
        {index !== 0 && (<div className="h-[1px] bg-gray-400"/>)}
          <ModalWrapper isOpen={shareFileModalOpen} onClose={() => setShareFileModalOpen(false)}>
            <ShareFileModal
              userId={userId}
              onClose={() => {
                setShareFileModalOpen(false);
              }}
              documentId={file.id}
            />
          </ModalWrapper>
        {/* Desktop версія */}
        <div className="hidden lg:flex w-full justify-between items-center p-4">
          
            <div className='w-1/5 text-center truncate px-2'>{file.name}</div>
            <div className='w-1/5 text-center truncate px-2'>{file.userOwnerEmail}</div>
            <div className='w-1/5 text-center text-sm px-2'>{
                new Date(file.createdTime).toLocaleDateString() + ' ' + new Date(file.createdTime).toLocaleTimeString()
            }</div>
            <div className='w-1/5 text-center text-sm px-2'>{
                (new Date().getTime() - new Date(file.modifiedTime).getTime() < 86400000) ? 'Today' :
                new Date(file.modifiedTime).toLocaleDateString() + ' ' + new Date(file.modifiedTime).toLocaleTimeString()
            }</div>
            <div className='w-1/5 text-center flex justify-center gap-2'>
                <Button variant='fileAction' size='fileAction' onClick={handleDownload}>
                    <FiDownload size={24}/>
                </Button>
                {userOwnerId === userId && <Button
                  variant="fileAction"
                  size="none"
                  className="h-6"
                  onClick={() => setShareFileModalOpen(true)}
                >
                  <IoPersonAddSharp size={24} />
                </Button>}
                <Button variant='fileAction' size='fileAction' onClick={handleEdit}>
                    <MdEdit size={24}/>
                </Button>
                {userOwnerId === userId && <Button className="hover:text-red-500" variant='fileAction' size='fileAction' onClick={handleDelete}>
                    <FaRegTrashAlt size={24} />
                </Button>}
            </div>
        </div>

        {/* Tablet версія */}
        <div className="hidden md:flex lg:hidden w-full flex-col p-4 space-y-3">
          
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="font-medium text-lg truncate pr-4">{file.name}</div>
              <div className="text-sm text-gray-600 truncate">{file.userOwnerEmail}</div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
                <Button variant='fileAction' size='fileAction' onClick={handleDownload}>
                    <FiDownload size={20}/>
                </Button>
                {userOwnerId === userId && <Button
                  variant="fileAction"
                  size="none"
                  className="h-6"
                  onClick={() => setShareFileModalOpen(true)}
                >
                  <IoPersonAddSharp size={20} />
                </Button>}
                <Button variant='fileAction' size='fileAction' onClick={handleEdit}>
                    <MdEdit size={20}/>
                </Button>
                {userOwnerId === userId && <Button className="hover:text-red-500" variant='fileAction' size='fileAction' onClick={handleDelete}>
                    <FaRegTrashAlt size={20} />
                </Button>}
            </div>
          </div>
          
          <div className="flex justify-between text-sm text-gray-500">
            <div>Created At: {new Date(file.createdTime).toLocaleDateString()}</div>
            <div>Last Modified: {
                (new Date().getTime() - new Date(file.modifiedTime).getTime() < 86400000) ? 'Сьогодні' :
                new Date(file.modifiedTime).toLocaleDateString()
            }</div>
          </div>
        </div>

        {/* Mobile версія */}
        <div className="flex md:hidden w-full flex-col p-4 space-y-3">
          
          <div className="flex flex-col space-y-2">
            <div className="font-medium text-lg break-words">{file.name}</div>
            <div className="text-sm text-gray-600 break-words">{file.userOwnerEmail}</div>
          </div>
          
          <div className="flex flex-col space-y-1 text-sm text-gray-500">
            <div>Created At: {new Date(file.createdTime).toLocaleDateString()}</div>
            <div>Last Modified: {
                (new Date().getTime() - new Date(file.modifiedTime).getTime() < 86400000) ? 'Сьогодні' :
                new Date(file.modifiedTime).toLocaleDateString()
            }</div>
          </div>
          
          <div className="flex justify-center gap-3 pt-2">
                <Button variant='fileAction' size='fileAction' onClick={handleDownload}>
                    <FiDownload size={20}/>
                </Button>
                {userOwnerId === userId && <Button
                  variant="fileAction"
                  size="none"
                  className="h-6"
                  onClick={() => setShareFileModalOpen(true)}
                >
                  <IoPersonAddSharp size={20} />
                </Button>}
                <Button variant='fileAction' size='fileAction' onClick={handleEdit}>
                    <MdEdit size={20}/>
                </Button>
                {userOwnerId === userId && <Button className="hover:text-red-500" variant='fileAction' size='fileAction' onClick={handleDelete}>
                    <FaRegTrashAlt size={20} />
                </Button>}
            </div>
        </div>
        </>
    );
}