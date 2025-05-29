import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { toast } from "react-toastify";
import { IoPersonRemove } from "react-icons/io5";
import Image from "next/image";

export default function AddParticipiantModel({
  meetingId,
  onClose,
}: {
  meetingId: number;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<{ id: number; image: string, email: string }[]>([]);

  
  const fetchParticipants = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/meetings/participants?meetingId=${meetingId}`);
      const data = await response.json();
      if (response.ok) {
        setParticipants(data.participants);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
      toast.error("Error fetching participants.");
    }
  }, [meetingId]);
  
  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const handleAddParticipant = async () => {
    if (!email) {
      toast.error("Please enter an email address.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/meetings/participants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingId,
          email,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setEmail("");
        fetchParticipants();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error adding participant: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipant = async (email: string) => {
    try {
      const response = await fetch("/api/meetings/participants", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingId,
          email,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        fetchParticipants();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error removing participant:" + (error as Error).message);
    }
  };

  return (
      <div className="bg-white rounded-lg p-6 w-[85%] sm:w-96 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Manage Participants</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddParticipant()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-200"
            placeholder="Enter email"
          />
        </div>
        <div className="flex justify-end gap-2 mb-4">
          <Button variant="default" size="default" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" size="default" onClick={handleAddParticipant}>
            {loading ? "Adding..." : "Add"}
          </Button>
        </div>
        <div>
          <h3 className="text-md font-medium mb-2">Participants:</h3>
          <div className="flex flex-col max-h-[110px] overflow-y-auto">
          {participants.length > 0 ? (
            participants.map((participant, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 border-b"
              >
                <Image className="rounded-full" src={participant.image} width={32} height={32} alt="avatar" />
                <span>{participant.email}</span>
                <Button
                  variant="fileAction"
                  size="sm"
                  onClick={() => handleRemoveParticipant(participant.email)}
                >
                  <IoPersonRemove size={24} />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No participants yet.</p>
          )}
          </div>
        </div>
      </div>
  );
}
