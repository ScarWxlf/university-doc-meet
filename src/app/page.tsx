'use client'
import { getSession } from 'next-auth/react';

export default function Home() {

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
