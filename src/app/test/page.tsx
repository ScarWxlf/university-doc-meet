'use client';
import { sendEmail } from "@/lib/email.mjs";
export default function Test(){

  const handleSendEmail = async () => {
    await sendEmail(
      "katchurcheferdavid@gmail.com",
      `Reminder: Meeting "HEHE"`,
      `Hello, your meeting "HEH" starts at 21.00.`
    );
  }

  return (
    <>    
    <h1>test</h1>
    <button onClick={handleSendEmail}>
      send email
    </button>
    </>
  );
}