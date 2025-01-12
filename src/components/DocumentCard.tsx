import { FiDownload } from "react-icons/fi";
import { CgMenuGridO } from "react-icons/cg";
import { MdEdit } from "react-icons/md";
import { Button } from "./button";
import { useRouter } from "next/navigation";


export default function DocumentCard({ file }: { file: Record<string, string> }) {

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
          console.error("Error downloading file:", error);
        }
      };

      const router = useRouter();

      const handleEdit = () => {
        router.push(`/editor?fileId=${file.id}`);
      };
      
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
                <Button variant='fileAction' size='fileAction'>
                    <CgMenuGridO size={24} />
                </Button>
            </div>
        </div>
        </>
    );
}