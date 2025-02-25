"use client";
import { Button } from "@/components/ui/button";
import { DatePickerDemo } from "@/components/ui/datepicker";
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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session, status } = useSession();
  const [documentType, setDocumentType] = useState("my");
  const [searchName, setSearchName] = useState("");
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const router = useRouter();

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
        if(session !== null){
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
            const uniqueDates = [
              ...new Set(data.files.map((file) => new Date(file.createdTime))),
            ];
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
    setData((prevData) => prevData.filter((file) => file.id !== fileId));
  };

  return (
    <div className="flex flex-col px-8 bg-gray-100 h-full">
      <div className="p-6">
        <div className="flex gap-2">
          <h1 className="text-3xl text-gray-700 font-medium">
            Document manegment
          </h1>
          <Select onValueChange={(value) => setDocumentType(value)} defaultValue={documentType}>
            <SelectTrigger className="w-[200px] bg-white mt-1">
              <SelectValue placeholder="Select a document type" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectGroup >
                <SelectItem className="hover:bg-green-500 hover:text-white rounded-md" value="my">My Documents</SelectItem>
                <SelectItem className="hover:bg-green-500 hover:text-white rounded-md" value="shared">Shared Documents</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-between mt-4">
          <Button
            className="rounded-full flex gap-2"
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
            <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <UploadModal
                userId={session?.user.id}
                onClose={() => setIsModalOpen(false)}
              />
            </ModalWrapper>
          <DatePickerDemo
            availableDates={availableDates}
            onDateSelect={setSelectedDate}
          />
          <div className="relative flex">
            {/* search */}
            <Image
              className="absolute top-1/2 -translate-y-1/2 left-1"
              src="/images/search.svg"
              width={20}
              height={20}
              alt="search"
            />
            <input
              type="text"
              placeholder="Search"
              className="border-b border-gray-400 px-7 py-1 bg-transparent focus:outline-none focus:border-black"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="bg-white px-3 rounded-xl shadow-xl">
        <div className="w-full flex items-center p-4">
          <p className="w-1/5 text-center">Document Name</p>
          <p className="w-1/5 text-center">Owner</p>
          <p className="w-1/5 text-center">Created At</p>
          <p className="w-1/5 text-center">Last Modified</p>
          <p className="w-1/5 text-center">Actions</p>
        </div>
        {loading ? (
          <Loading />
        ) : data && data.length > 0 && session !== null ? (
          data.map((file, index) => (
            <DocumentCard key={index} file={file} userId={session.user.id} onDelete={handleDeleteDocument} />
          ))
        ) : (
          <p className="text-center text-lg p-4">No documents found 😥</p>
        )}
      </div>
    </div>
  );
}
