'use client'
import { Button } from '@/components/button';
import DocumentCard from '@/components/DocumentCard';
import UploadModal from '@/components/UploadDocModal';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const url = new URL(window.location.href);
    const loginSuccess = url.searchParams.get('loginSuccess');

    if (loginSuccess === 'true') {
      toast.success('Login successful!', {
        position: 'bottom-right',
      });
      url.searchParams.delete('loginSuccess');
      window.history.replaceState({}, '', url.toString());
    }

    async function getFiles() {
      setLoading(true);
      if(status !== 'loading'){
        const response = await fetch('/api/google/getfiles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session?.user?.id,
          }),
        })
        const data = await response.json();
        setData(data.files);
        setLoading(false);
      }
    }
    getFiles();
  }, [session, status, isModalOpen]);


  return (
    <div className="flex flex-col px-8 bg-gray-100">
      <div className='p-6'>
        <h1 className='text-3xl text-gray-700 font-medium'>Document manegment</h1>
        <div className='flex justify-between mt-4'>
            <Button className='rounded-full flex gap-2' variant='default' size='default' onClick={() => setIsModalOpen(true)}>
              <Image src='/images/add-doc-button.svg' width={20} height={20} alt='add document' />
              Add New Document
            </Button>
            {isModalOpen && (
              <UploadModal userId={session?.user?.id} onClose={() => setIsModalOpen(false)} />
            )}
            <div className='relative flex'>
              {/* search */}
              <Image className='absolute top-1/2 -translate-y-1/2 left-1' src='/images/search.svg' width={20} height={20} alt='search' />
              <input type='text' placeholder='Search' className='border-b border-gray-400 px-7 py-1 bg-transparent focus:outline-none focus:border-black'/>
            </div>
        </div>
      </div>
      <div className='bg-white px-3 rounded-xl shadow-xl'>
        <div className='w-full flex items-center p-4'>
          <p className='w-1/5 text-center'>Document Name</p>
          <p className='w-1/5 text-center'>Owner</p>
          <p className='w-1/5 text-center'>Created At</p>
          <p className='w-1/5 text-center'>Last Modified</p>
          <p className='w-1/5 text-center'>Actions</p>
        </div>
        { loading ? 
        <div className="m-4 flex items-center justify-center">
        <div className="loader w-6 h-6 border-4 border-t-transparent border-green-500 rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-500">Loading...</span>
      </div>
      :
        data && data.map((file, index) => (
          <DocumentCard key={index} file={file} />
        ))
      }
      </div>
    </div>
  );
}
