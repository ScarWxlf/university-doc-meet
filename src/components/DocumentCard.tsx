import { FiDownload } from "react-icons/fi";
import { MdEdit } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";


export default function DocumentCard({ file, userId }: { file: Record<string, string>, userId: string }) {
    const router = useRouter();
    const userOwnerId = file.userOwnerId || userId;

    const handleDownload = async () => {
        try {
          // API для отримання посилання на завантаження
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
            router.refresh();
          } else {
            toast.error(data?.error);
          }
        } catch (error) {
          console.error("Error deleting file:", (error as Error).message);
        }
      }
    return (
        <>
        <div className="h-[1px] bg-gray-400"/>
        <div className="w-full flex justify-between items-center p-4">
            <div className='w-1/5 text-center'>{file.name}</div>
            <div className='w-1/5 text-center'>John Doe</div>
            <div className='w-1/5 text-center'>{
                new Date(file.createdTime).toLocaleDateString() + ' ' + new Date(file.createdTime).toLocaleTimeString()
            }</div>
            <div className='w-1/5 text-center'>{
                (new Date().getTime() - new Date(file.modifiedTime).getTime() < 86400000) ? 'Today' :
                new Date(file.modifiedTime).toLocaleDateString() + ' ' + new Date(file.modifiedTime).toLocaleTimeString()
            }</div>
            <div className='w-1/5 text-center flex justify-center gap-2'>
                <Button variant='fileAction' size='fileAction' onClick={handleDownload}>
                    <FiDownload size={24}/>
                </Button>
                <Button variant='fileAction' size='fileAction' onClick={handleEdit}>
                    <MdEdit size={24}/>
                </Button>
                {userOwnerId === userId && <Button className="hover:text-red-500" variant='fileAction' size='fileAction' onClick={handleDelete}>
                    <FaRegTrashAlt size={24} />
                </Button>}
            </div>
        </div>
        </>
    );
}