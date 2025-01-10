'use client'
import { useSession } from "next-auth/react";
import { createUserFolderIfNotExists } from "@/lib/googleDriveUtils";


export default function Home() {
    const { data: session, status } = useSession();
    console.log(session)
    const handler = async () =>{
        const response = await createUserFolderIfNotExists(session!.user!.id)
        console.log(response)
    }
    return(
        <div>
            <h1>Home</h1>
            <button onClick={()=>{
                handler()
            }}>Save on Drive</button>
        </div>
    )
}