import Image from "next/image";
import { FiDownload } from "react-icons/fi";
import { CgMenuGridO } from "react-icons/cg";
import { MdEdit } from "react-icons/md";

export default function DocumentCard({ file }: { file: Record<string, string> }) {
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
                <FiDownload size={24} className='text-gray-500' />
                <MdEdit size={24} className='text-gray-500' />
                <CgMenuGridO size={24} className='text-gray-500' />
            </div>
        </div>
        </>
    );
}