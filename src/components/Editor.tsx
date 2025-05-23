"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Quill from "quill";
import * as quillToWord from "quill-to-word";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import Loading from "@/components/ui/loading";
import { useSession } from "next-auth/react";

export default function Editor() {
  const { data: session } = useSession();

  const searchParams = useSearchParams();
  const fileId = searchParams.get("fileId");
  const [fileName, setFileName] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [permission, setPermission] = useState<"EDIT" | "VIEW">("VIEW");
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      return;
    }
    if (
      typeof window !== "undefined" &&
      editorRef.current &&
      !quillRef.current
    ) {
      const quillInstance = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"], // toggled buttons
            ["blockquote", "code-block"],
            ["link", "image", "video", "formula"],

            [{ list: "ordered" }, { list: "bullet" }],
            [{ script: "sub" }, { script: "super" }], // superscript/subscript
            [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
            [{ direction: "rtl" }], // text direction

            [{ header: [1, 2, 3, 4, 5, 6, false] }],

            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],

            ["clean"], // remove formatting button
          ],
          // [
          //   [{ header: [1, 2, 3, false] }],
          //   ["bold", "italic", "underline", "strike"],
          //   [{ list: "ordered" }, { list: "bullet" }],
          //   ["link", "image"],
          //   ["clean"],
          // ],
        },
      });
      quillRef.current = quillInstance;
    }

    async function fetchFile() {
      try {
        setLoading(true);
        const response = await fetch("/api/google/getfilecontent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileId,
            userId: session?.user?.id,
            userEmail: session?.user?.email,
          }),
        });

        if (response.redirected) {
          window.location.href = response.url;
          return;
        }

        if (response.ok) {
          const { content, name, mimeType, permission } = await response.json();
           setFileName(name);
           setMimeType(mimeType);
           setPermission(permission);
           
          const parsedContent =
          typeof content === "string" ? content : JSON.stringify(content);
          if (
            [
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "text/html",
            ].includes(mimeType)
          ) {
            if(permission === "VIEW"){
              const toolbar = document.querySelector(".ql-toolbar");
              toolbar?.classList.add("disabled-toolbar");
              toolbar?.setAttribute("data-tooltip", "You don't have permission to edit");
            }
            quillRef.current?.enable();
            quillRef.current?.clipboard.dangerouslyPasteHTML(content);
          } else if (["text/plain", "application/json"].includes(mimeType)) {
            if (typeof window !== "undefined") {
              const toolbar = document.querySelector(".ql-toolbar");
              toolbar?.classList.add("disabled-toolbar");
              toolbar?.setAttribute("data-tooltip", "Editing is disabled");
              quillRef.current?.setText(parsedContent);
            }
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching file content:", error);
      }
    }

    fetchFile();
  }, [fileId, session]);

  const handleSave = async () => {
    try {
      const isSimpleText = ["text/plain", "application/json"].includes(
        mimeType
      );
      const isHTML = mimeType === "text/html";
      const isDOCX =
        mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      let content;

      if (isSimpleText) {
        content = quillRef.current?.getText();
      } else if (isHTML) {
        content = quillRef.current?.root.innerHTML;
      } else if (isDOCX) {
        const delta = quillRef.current!.getContents();
        const config: quillToWord.Config = {
          exportAs: "base64",
        };
        content = await quillToWord.generateWord(delta, config);
      }

      const response = await fetch("/api/google/updatefile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId,
          mimeType,
          content: content,
        }),
      });

      if (response.ok) {
        toast.success("File saved successfully!");
      } else {
        toast.error("Failed to save file");
      }
    } catch (error) {
      toast.error("Error saving file:" + (error as Error).message);
    }
  };

  return (
    <div className="p-4">
      {loading && <Loading />}
      <div className={cn(loading && "hidden")}>
        <div
          className={cn(
            "flex justify-between items-center mb-4",
            loading && "hidden"
          )}
        >
          <h1 className="text-xl font-bold">{fileName}</h1>
          <Button variant="default" size="default" onClick={handleSave} disabled={permission === "VIEW"}>
            Save
          </Button>
        </div>
        <div className="border p-4 rounded-lg shadow">
          <div ref={editorRef} className="h-[500px]"></div>
        </div>
      </div>
    </div>
  );
}
