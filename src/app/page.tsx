'use client'
import { getSession } from 'next-auth/react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

export default function Home() {

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

  const handler = async () =>{
    const session = await getSession();
    console.log(session)
  }
  return (
    <div className="flex" >
      Home
      <button onClick={handler}>Get Session</button>
    </div>
  );
}
