import Image from "next/image";
import { useState } from "react";

export default function DecorativeFileSection({
  bgImage,
}: {
  bgImage: string;
}) {
  const [animated, setAnimated] = useState(false);

  const handleMouseEnter = () => {
    if (!animated) {
      setAnimated(true);
      setTimeout(() => {
        setAnimated(false);
      }, 3000);
    }
  };
  return (
    <div className="w-full lg:w-2/5 relative h-64 lg:h-full">
      <Image src={bgImage} fill alt="employee" className="object-cover" />
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50"></div>
      <div className="absolute flex w-full h-full">
        <div className="relative flex w-full h-full justify-around items-center">
          <Image
            className="w-32 h-32 min-[670px]:h-40 min-[670px]:w-40 lg:h-[300px] lg:w-[300px] lg:absolute lg:top-2 lg:left-2 z-10 -rotate-[10deg] hover:scale-110 transition-transform duration-300 shadow-filter"
            src="/images/doc.png"
            width={300}
            height={300}
            alt="doc"
          />
          <Image
            className="order-1 w-32 h-32 min-[670px]:h-40 min-[670px]:w-40 lg:h-[300px] lg:w-[300px] lg:absolute lg:left-10 lg:bottom-2 z-20 rotate-[30deg] hover:scale-110 transition-transform duration-300 shadow-filter"
            src="/images/pdf.png"
            width={300}
            height={300}
            alt="pdf"
          />
          <div className="w-32 h-32 min-[670px]:h-40 min-[670px]:w-40">
            <Image
              className={`w-32 h-32 min-[670px]:h-40 min-[670px]:w-40 lg:h-[300px] lg:w-[300px] lg:translate-y-0 absolute lg:left-1/2 -top-[40px] min-[670px]:-top-[70px] lg:top-5 rotate-[50deg] z-30 transition-transform origin-bottom-left shadow-filter ${
                animated ? "animate-fallAndWobble" : ""
              }`}
              src="/images/xls.png"
              onMouseOver={handleMouseEnter}
              width={300}
              height={300}
              alt="xls"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
