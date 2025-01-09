import Image from "next/image";


export default function DocumentCard() {
    return (
        <>
        <div className="h-[1px] bg-gray-400"/>
        <div className="w-full flex justify-between items-center p-4">
            <div className='w-1/5 text-center'>Some Name</div>
            <div className='w-1/5 text-center'>John Doe</div>
            <div className='w-1/5 text-center'>02/01</div>
            <div className='w-1/5 text-center'>2 days ago</div>
            <div className='w-1/5 text-center flex justify-center'>
                <button className='mr-2'>
                    <Image src='/images/edit.svg' width={20} height={20} alt='edit' />
                </button>
                <button>
                    <Image src='/images/menu.svg' width={20} height={20} alt='menu' />
                </button>
            </div>
        </div>
        </>
    );
}