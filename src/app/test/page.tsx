'use client';

export default function Test(){

  async function test(){
    const res = await fetch('/api/test');
    const data = await res.json();
    console.log(data)
  }
  return (
    <>    
    <h1>test</h1>
    <button onClick={test}>test</button>
    </>
  );
}