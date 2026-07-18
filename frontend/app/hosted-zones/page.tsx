"use client";

import { useEffect, useState } from "react";
import { MoreVertical, Plus, Search } from "lucide-react";
import toast from "react-hot-toast";

import Modal from "@/components/Modal";
import { useRouter } from "next/navigation";

import api from "@/lib/api";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

interface HostedZone {
  id: number;
  name: string;
  zone_type: string;
  description: string | null;
  private_zone: boolean;
  record_count: number;
  created_at: string;
}

export default function HostedZonesPage() {
  const router = useRouter();

  const [zones, setZones] = useState<HostedZone[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] =
  useState(false);

const [zoneName, setZoneName] = useState("");
const [zoneDescription, setZoneDescription] =
  useState("");

const [creating, setCreating] = useState(false);

const [editingZone, setEditingZone] =
  useState<HostedZone | null>(null);

const [editName, setEditName] = useState("");
const [editDescription, setEditDescription] =
  useState("");

const [deletingZone, setDeletingZone] =
  useState<HostedZone | null>(null);

const [processing, setProcessing] = useState(false);

  const fetchZones = async () => {
    try {
      const response = await api.get("/zones", {
        params: {
          search: search || undefined,
        },
      });

      setZones(response.data);
    } catch (error) {
      console.error("Failed to fetch hosted zones");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateZone = async () => {
  if (!zoneName.trim()) {
    toast.error("Hosted zone name is required");

    return;
  }

  setCreating(true);

  try {
    await api.post("/zones", {
      name: zoneName,
      zone_type: "Public",
      description: zoneDescription || null,
      private_zone: false,
    });

    toast.success("Hosted zone created successfully");

    setZoneName("");
    setZoneDescription("");

    setShowCreateModal(false);

    await fetchZones();
  } catch (error: any) {
    toast.error(
      error.response?.data?.detail ||
        "Failed to create hosted zone"
    );
  } finally {
    setCreating(false);
  }
};

const handleUpdateZone = async () => {
  if (!editingZone) {
    return;
  }

  if (!editName.trim()) {
    toast.error("Hosted zone name is required");

    return;
  }

  setProcessing(true);

  try {
    await api.put(`/zones/${editingZone.id}`, {
      name: editName,
      description: editDescription || null,
    });

    toast.success("Hosted zone updated successfully");

    setEditingZone(null);

    await fetchZones();
  } catch (error: any) {
    toast.error(
      error.response?.data?.detail ||
        "Failed to update hosted zone"
    );
  } finally {
    setProcessing(false);
  }
};

const handleDeleteZone = async () => {
  if (!deletingZone) {
    return;
  }

  setProcessing(true);

  try {
    await api.delete(
      `/zones/${deletingZone.id}`
    );

    toast.success("Hosted zone deleted successfully");

    setDeletingZone(null);

    await fetchZones();
  } catch (error: any) {
    toast.error(
      error.response?.data?.detail ||
        "Failed to delete hosted zone"
    );
  } finally {
    setProcessing(false);
  }
};

  useEffect(() => {
    const token = localStorage.getItem("route53_token");

    if (!token) {
      router.push("/login");

      return;
    }

    fetchZones();
  }, [search]);

  return (
    <div className="min-h-screen bg-[#f2f3f3]">
      <Sidebar />

      <Header />

      <main className="ml-64 pt-16">
        <div className="p-8">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#161e2d]">
                Hosted zones
              </h1>

              <p className="mt-2 text-sm text-gray-600">
                Manage your hosted zones and DNS records.
              </p>
            </div>

<button
  onClick={() => setShowCreateModal(true)}
  className="flex items-center gap-2 bg-[#ff9900] px-5 py-2.5 text-sm font-semibold text-[#161e2d] transition hover:bg-[#ec7211]"
>              <Plus size={17} />

              Create hosted zone
            </button>
          </div>

          <div className="border border-[#d5dbdb] bg-white">
            <div className="flex items-center justify-between border-b border-[#eaeded] px-6 py-4">
              <div>
                <h2 className="font-semibold text-[#161e2d]">
                  Hosted zones
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {zones.length} hosted zone
                  {zones.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search hosted zones"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  className="w-72 border border-[#879596] py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0972ce]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f7f8f8] text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-6 py-4 font-semibold">
                      Name
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Type
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Records
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Description
                    </th>

                    <th className="px-6 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#eaeded]">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        Loading hosted zones...
                      </td>
                    </tr>
                  ) : zones.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No hosted zones found.
                      </td>
                    </tr>
                  ) : (
                    zones.map((zone) => (
                      <tr
                        key={zone.id}
                        onClick={() =>
                          router.push(
                            `/hosted-zones/${zone.id}`
                          )
                        }
                        className="cursor-pointer transition hover:bg-[#f7f8f8]"
                      >
                        <td className="px-6 py-5 font-medium text-[#0972ce]">
                          {zone.name}
                        </td>

                        <td className="px-6 py-5 text-gray-700">
                          {zone.private_zone
                            ? "Private"
                            : "Public"}
                        </td>

                        <td className="px-6 py-5 text-gray-700">
                          {zone.record_count}
                        </td>

                        <td className="px-6 py-5 text-gray-600">
                          {zone.description || "—"}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();

                              setEditingZone(zone);
                              setEditName(zone.name);
                              setEditDescription(
                                zone.description || ""
                              );
                            }}
                            className="mr-3 text-sm font-medium text-[#0972ce] hover:underline"
                          >
                            Edit
                          </button>

                          <button
                            onClick={(event) => {
                              event.stopPropagation();

                              setDeletingZone(zone);
                            }}
                            className="text-sm font-medium text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      {showCreateModal && (
  <Modal
    title="Create hosted zone"
    onClose={() => setShowCreateModal(false)}
  >
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-[#161e2d]">
          Domain name
        </label>

        <input
          type="text"
          placeholder="example.com"
          value={zoneName}
          onChange={(event) =>
            setZoneName(event.target.value)
          }
          className="w-full border border-[#879596] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0972ce]"
        />

        <p className="mt-2 text-xs text-gray-500">
          Enter the domain name for the hosted zone.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#161e2d]">
          Description - optional
        </label>

        <textarea
          placeholder="Production hosted zone"
          value={zoneDescription}
          onChange={(event) =>
            setZoneDescription(event.target.value)
          }
          rows={3}
          className="w-full resize-none border border-[#879596] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0972ce]"
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-[#eaeded] pt-5">
        <button
          onClick={() => setShowCreateModal(false)}
          className="border border-[#879596] px-4 py-2 text-sm font-medium text-[#161e2d] hover:bg-[#f2f3f3]"
        >
          Cancel
        </button>

        <button
          onClick={handleCreateZone}
          disabled={creating}
          className="bg-[#ff9900] px-5 py-2 text-sm font-semibold text-[#161e2d] hover:bg-[#ec7211]"
        >
          {creating ? "Creating..." : "Create hosted zone"}
        </button>
      </div>
    </div>
  </Modal>
)}

{editingZone && (
  <Modal
    title="Edit hosted zone"
    onClose={() => setEditingZone(null)}
  >
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-[#161e2d]">
          Domain name
        </label>

        <input
          type="text"
          value={editName}
          onChange={(event) =>
            setEditName(event.target.value)
          }
          className="w-full border border-[#879596] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0972ce]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#161e2d]">
          Description
        </label>

        <textarea
          value={editDescription}
          onChange={(event) =>
            setEditDescription(event.target.value)
          }
          rows={3}
          className="w-full resize-none border border-[#879596] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0972ce]"
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-[#eaeded] pt-5">
        <button
          onClick={() => setEditingZone(null)}
          className="border border-[#879596] px-4 py-2 text-sm font-medium text-[#161e2d] hover:bg-[#f2f3f3]"
        >
          Cancel
        </button>

        <button
          onClick={handleUpdateZone}
          disabled={processing}
          className="bg-[#ff9900] px-5 py-2 text-sm font-semibold text-[#161e2d] hover:bg-[#ec7211]"
        >
          {processing ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  </Modal>
)}

{deletingZone && (
  <Modal
    title="Delete hosted zone"
    onClose={() => setDeletingZone(null)}
  >
    <div>
      <p className="text-sm leading-6 text-gray-700">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-[#161e2d]">
          {deletingZone.name}
        </span>
        ?
      </p>

      <p className="mt-3 text-sm text-red-600">
        This action cannot be undone.
      </p>

      <div className="mt-6 flex justify-end gap-3 border-t border-[#eaeded] pt-5">
        <button
          onClick={() => setDeletingZone(null)}
          className="border border-[#879596] px-4 py-2 text-sm font-medium text-[#161e2d] hover:bg-[#f2f3f3]"
        >
          Cancel
        </button>

        <button
          onClick={handleDeleteZone}
          disabled={processing}
          className="bg-[#d13212] px-5 py-2 text-sm font-semibold text-white hover:bg-[#a91f0c]"
        >
          {processing ? "Deleting..." : "Delete hosted zone"}
        </button>
      </div>
    </div>
  </Modal>
)}

    </div>
  );
}