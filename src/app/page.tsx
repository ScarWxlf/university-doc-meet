"use client";
import { Button } from "@/components/ui/button";
import { DatePickerDemo } from "@/components/ui/datepicker";
import MediaDocumentCard from "@/components/MediaDocumentCard";
import DocumentCard from "@/components/DocumentCard";
import Loading from "@/components/ui/loading";
import UploadModal from "@/components/UploadDocModal";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import ModalWrapper from "@/components/ModalWrapper";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FileType = {
  id: string;
  name: string;
  createdTime: string;
  // add other properties as needed
};

export default function Home() {
  const [data, setData] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session, status } = useSession();
  const [documentType, setDocumentType] = useState("my");
  const [searchName, setSearchName] = useState("");
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const router = useRouter();

  const isMediaFile = (name: string) => {
    return (
      name.endsWith(".pdf") ||
      name.endsWith(".jpeg") ||
      name.endsWith(".jpg") ||
      name.endsWith(".png")
    );
  };
  // const [debouncedSearch, setDebouncedSearch] = useState("");
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setDebouncedSearch(searchName);
  //   }, 1000);

  //   return () => clearTimeout(timer);
  // }, [searchName]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const loginSuccess = url.searchParams.get("loginSuccess");

    if (loginSuccess === "true") {
      toast.success("Login successful!", {
        position: "bottom-right",
      });
      url.searchParams.delete("loginSuccess");
      window.history.replaceState({}, "", url.toString());
    }

    async function getFiles() {
      setLoading(true);
      if (status !== "loading") {
        if (session !== null) {
          const response = await fetch("/api/google/getfiles", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: session?.user?.id,
              userEmail: session?.user?.email,
              documentType,
              searchName,
              selectedDate,
            }),
          });
          const data = await response.json();
          setData(data.files);
          if (data.files) {
            const uniqueDates: Date[] = Array.from(
              new Set(
                data.files.map(
                  (file: { createdTime: string }) => new Date(file.createdTime)
                )
              )
            );
            setAvailableDates(uniqueDates);
          }
        }
        setLoading(false);
      }
    }
    getFiles();
  }, [session, status, isModalOpen, documentType, searchName, selectedDate]);

  const handleUploadDocument = async () => {
    if (!session?.user?.id) {
      router.push("/signin");
      return;
    }
    setIsModalOpen(true);
  };

  const handleDeleteDocument = (fileId: string) => {
    setData((prevData) =>
      prevData.filter((file: { id: string }) => file.id !== fileId)
    );
  };

  return (
    <div className="flex flex-col flex-grow px-8 bg-gray-100 h-full pb-2">
      <div className="p-4 md:p-6">
        <ModalWrapper
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <UploadModal
            userId={session?.user.id}
            userEmail={session?.user.email ?? undefined}
            onClose={() => setIsModalOpen(false)}
          />
        </ModalWrapper>
        {/* Desktop/Tablet версія */}
        <div className="hidden md:block">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-2">
            <h1 className="text-2xl lg:text-3xl text-gray-700 font-medium">
              Document management
            </h1>
            <Select
              onValueChange={(value) => setDocumentType(value)}
              defaultValue={documentType}
            >
              <SelectTrigger className="w-full lg:w-[200px] bg-white">
                <SelectValue placeholder="Select a document type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectGroup>
                  <SelectItem
                    className="hover:bg-green-500 hover:text-white rounded-md"
                    value="my"
                  >
                    My Documents
                  </SelectItem>
                  <SelectItem
                    className="hover:bg-green-500 hover:text-white rounded-md"
                    value="shared"
                  >
                    Shared Documents
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mt-4">
            <Button
              className="rounded-full flex gap-2 w-full lg:w-auto"
              variant="default"
              size="default"
              onClick={handleUploadDocument}
            >
              <Image
                src="/images/add-doc-button.svg"
                width={20}
                height={20}
                alt="add document"
              />
              Add New Document
            </Button>

            <div className="flex flex-col sm:flex-row gap-4 lg:gap-4">
              <DatePickerDemo
                availableDates={availableDates}
                onDateSelect={setSelectedDate}
              />
              <div className="relative flex">
                <Image
                  className="absolute top-1/2 -translate-y-1/2 left-2"
                  src="/images/search.svg"
                  width={20}
                  height={20}
                  alt="search"
                />
                <input
                  type="text"
                  placeholder="Search"
                  className="border-b border-gray-400 px-8 py-2 bg-transparent focus:outline-none focus:border-black w-full min-w-[200px]"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile версія */}
        <div className="block md:hidden space-y-4">
          {/* Заголовок та селект */}
          <div className="space-y-3">
            <h1 className="text-xl text-gray-700 font-medium text-center">
              Document Management
            </h1>
            <Select
              onValueChange={(value) => setDocumentType(value)}
              defaultValue={documentType}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectGroup>
                  <SelectItem
                    className="hover:bg-green-500 hover:text-white rounded-md"
                    value="my"
                  >
                    My Documents
                  </SelectItem>
                  <SelectItem
                    className="hover:bg-green-500 hover:text-white rounded-md"
                    value="shared"
                  >
                    Shared Documents
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Кнопка додавання */}
          <Button
            className="rounded-full flex gap-2 w-full justify-center"
            variant="default"
            size="default"
            onClick={handleUploadDocument}
          >
            <Image
              src="/images/add-doc-button.svg"
              width={20}
              height={20}
              alt="add document"
            />
            Add New Document
          </Button>

          {/* Пошук та фільтр дат */}
          <div className="space-y-3">
            {/* Пошук */}
            <div className="relative flex">
              <Image
                className="absolute top-1/2 -translate-y-1/2 left-3"
                src="/images/search.svg"
                width={18}
                height={18}
                alt="search"
              />
              <input
                type="text"
                placeholder="Search documents..."
                className="border border-gray-300 rounded-lg px-10 py-3 bg-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 w-full"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            {/* Фільтр дат */}
            <div className="w-full">
              <DatePickerDemo
                availableDates={availableDates}
                onDateSelect={setSelectedDate}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white px-3 rounded-xl shadow-xl">
        <div className="w-full  hidden lg:flex items-center p-4 ">
          <p className="w-1/5 text-center">Document Name</p>
          <p className="w-1/5 text-center">Owner</p>
          <p className="w-1/5 text-center">Created At</p>
          <p className="w-1/5 text-center">Last Modified</p>
          <p className="w-1/5 text-center">Actions</p>
        </div>
        {loading ? (
          <Loading />
        ) : data && data.length > 0 && session !== null ? (
          data.map((file, index) => {
            const name = file.name.toLowerCase();
            return isMediaFile(name) ? (
              <MediaDocumentCard
                key={index}
                index={index}
                file={file}
                userId={session.user.id}
                onDelete={handleDeleteDocument}
              />
            ) : (
              <DocumentCard
                key={index}
                index={index}
                file={file}
                userId={session.user.id}
                onDelete={handleDeleteDocument}
              />
            );
          })
        ) : (
          <p className="text-center text-lg p-4">No documents found 😥</p>
        )}
      </div>
    </div>
  );
}
