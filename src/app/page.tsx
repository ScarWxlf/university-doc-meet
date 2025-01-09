'use client'
import { Button } from '@/components/button';
import DocumentCard from '@/components/DocumentCard';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

export default function Home() {
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
  });


  return (
    <div className="flex flex-col px-8 h-full bg-gray-200">
      <div className='p-6'>
        <h1 className='text-3xl text-gray-700 font-medium'>Document manegment</h1>
        <div className='flex justify-between mt-4'>
            <Button className='rounded-full flex gap-2' variant='default' size='default'>
              <Image src='/images/add-doc-button.svg' width={20} height={20} alt='add document' />
              Add New Document
            </Button>
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
        <DocumentCard />
        <DocumentCard />
      </div>
    </div>
  );
}
