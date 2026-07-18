"use client";

import { useEffect, useState, use } from "react";
import { ChevronRight, Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Modal from "@/components/Modal";
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

interface DNSRecord {
  id: number;
  zone_id: number;
  name: string;
  record_type: string;
  ttl: number;
  value: string;
  routing_policy: string | null;
  created_at: string;
}

const RECORD_TYPES = ["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"];

export default function HostedZoneDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [zone, setZone] = useState<HostedZone | null>(null);
  const [records, setRecords] = useState<DNSRecord[]>([]);
  
  const [search, setSearch] = useState("");
  const [recordTypeFilter, setRecordTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DNSRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<DNSRecord | null>(null);
  
  // Form state
  const [recordName, setRecordName] = useState("");
  const [recordType, setRecordType] = useState("A");
  const [recordValue, setRecordValue] = useState("");
  const [recordTtl, setRecordTtl] = useState(300);
  const [routingPolicy, setRoutingPolicy] = useState("Simple");
  
  const [processing, setProcessing] = useState(false);

  const fetchZoneAndRecords = async () => {
    try {
      const zoneRes = await api.get(`/zones/${id}`);
      setZone(zoneRes.data);

      const recordsRes = await api.get(`/zones/${id}/records`, {
        params: {
          search: search || undefined,
          record_type: recordTypeFilter || undefined,
        },
      });
      setRecords(recordsRes.data);
    } catch (error) {
      console.error("Failed to fetch zone or records");
      toast.error("Failed to load zone details");
      router.push("/hosted-zones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("route53_token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchZoneAndRecords();
  }, [id, search, recordTypeFilter]);

  const resetForm = () => {
    setRecordName("");
    setRecordType("A");
    setRecordValue("");
    setRecordTtl(300);
    setRoutingPolicy("Simple");
  };

  const handleCreateRecord = async () => {
    if (!zone) return;
    
    // name could be empty if it's the root domain, but usually backend requires it. 
    // Wait, Route53 allows empty prefix for root domain. We'll send the full name.
    const fullRecordName = recordName ? `${recordName}.${zone.name}` : zone.name;

    if (!recordValue.trim()) {
      toast.error("Value is required");
      return;
    }

    setProcessing(true);
    try {
      await api.post(`/zones/${id}/records`, {
        name: fullRecordName,
        record_type: recordType,
        ttl: recordTtl,
        value: recordValue,
        routing_policy: routingPolicy,
      });

      toast.success("Record created successfully");
      setShowCreateModal(false);
      resetForm();
      await fetchZoneAndRecords();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create record");
    } finally {
      setProcessing(false);
    }
  };

  const openEditModal = (record: DNSRecord) => {
    setEditingRecord(record);
    
    // Extract prefix if possible
    let prefix = record.name;
    if (zone && record.name.endsWith(`.${zone.name}`)) {
        prefix = record.name.substring(0, record.name.length - zone.name.length - 1);
    } else if (zone && record.name === zone.name) {
        prefix = "";
    }
    
    setRecordName(prefix);
    setRecordType(record.record_type);
    setRecordValue(record.value);
    setRecordTtl(record.ttl);
    setRoutingPolicy(record.routing_policy || "Simple");
  };

  const handleUpdateRecord = async () => {
    if (!editingRecord || !zone) return;

    const fullRecordName = recordName ? `${recordName}.${zone.name}` : zone.name;

    if (!recordValue.trim()) {
      toast.error("Value is required");
      return;
    }

    setProcessing(true);
    try {
      await api.put(`/records/${editingRecord.id}`, {
        name: fullRecordName,
        record_type: recordType,
        ttl: recordTtl,
        value: recordValue,
        routing_policy: routingPolicy,
      });

      toast.success("Record updated successfully");
      setEditingRecord(null);
      resetForm();
      await fetchZoneAndRecords();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update record");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!deletingRecord) return;

    setProcessing(true);
    try {
      await api.delete(`/records/${deletingRecord.id}`);
      toast.success("Record deleted successfully");
      setDeletingRecord(null);
      await fetchZoneAndRecords();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete record");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f3f3]">
      <Sidebar />
      <Header />

      <main className="ml-64 pt-16">
        <div className="p-8">
          {/* Breadcrumbs */}
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/hosted-zones" className="hover:text-[#0972ce] hover:underline">
              Hosted zones
            </Link>
            <ChevronRight size={16} />
            <span className="text-[#161e2d] font-medium">{zone?.name || "Loading..."}</span>
          </div>

          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#161e2d]">
                {zone?.name || "Loading..."}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage the DNS records for this hosted zone.
              </p>
            </div>
          </div>

          {/* Records Table Card */}
          <div className="border border-[#d5dbdb] bg-white">
            <div className="flex flex-wrap items-center justify-between border-b border-[#eaeded] px-6 py-4 gap-4">
              <div>
                <h2 className="font-semibold text-[#161e2d]">Records</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {records.length} record{records.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search records by name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64 border border-[#879596] py-1.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0972ce]"
                  />
                </div>

                {/* Filter by Type */}
                <select
                  value={recordTypeFilter}
                  onChange={(e) => setRecordTypeFilter(e.target.value)}
                  className="border border-[#879596] py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0972ce] bg-white"
                >
                  <option value="">All types</option>
                  {RECORD_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(true);
                  }}
                  className="flex items-center gap-2 bg-[#ff9900] px-4 py-1.5 text-sm font-semibold text-[#161e2d] transition hover:bg-[#ec7211]"
                >
                  <Plus size={16} />
                  Create record
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f7f8f8] text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Record name</th>
                    <th className="px-6 py-4 font-semibold">Type</th>
                    <th className="px-6 py-4 font-semibold">Routing policy</th>
                    <th className="px-6 py-4 font-semibold">Value/Route to</th>
                    <th className="px-6 py-4 font-semibold">TTL (seconds)</th>
                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaeded]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        Loading records...
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.id} className="transition hover:bg-[#f7f8f8]">
                        <td className="px-6 py-4 font-medium text-[#161e2d] break-all max-w-[200px]">
                          {record.name}
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-medium">
                          {record.record_type}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {record.routing_policy || "Simple"}
                        </td>
                        <td className="px-6 py-4 text-gray-600 whitespace-pre-wrap break-all max-w-[300px]">
                          {record.value}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {record.ttl}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openEditModal(record)}
                            className="mr-3 text-sm font-medium text-[#0972ce] hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingRecord(record)}
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

      {/* Create Modal */}
      {showCreateModal && (
        <Modal title="Create record" onClose={() => setShowCreateModal(false)}>
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#161e2d]">Record name</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="www"
                  value={recordName}
                  onChange={(e) => setRecordName(e.target.value)}
                  className="flex-1 border border-[#879596] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0972ce]"
                />
                <span className="text-gray-500 text-sm">.{zone?.name}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Leave blank for root domain.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#161e2d]">Record type</label>
                <select
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value)}
                  className="w-full border border-[#879596] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0972ce] bg-white"
                >
                  {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#161e2d]">TTL (Seconds)</label>
                <input
                  type="number"
                  value={recordTtl}
                  onChange={(e) => setRecordTtl(parseInt(e.target.value) || 0)}
                  className="w-full border border-[#879596] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0972ce]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#161e2d]">Value</label>
              <textarea
                value={recordValue}
                onChange={(e) => setRecordValue(e.target.value)}
                rows={3}
                placeholder="Enter record value (e.g. 192.0.2.1)"
                className="w-full resize-none border border-[#879596] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0972ce]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#161e2d]">Routing policy</label>
              <select
                value={routingPolicy}
                onChange={(e) => setRoutingPolicy(e.target.value)}
                className="w-full border border-[#879596] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0972ce] bg-white"
              >
                <option value="Simple">Simple routing</option>
                <option value="Weighted">Weighted routing</option>
                <option value="Failover">Failover routing</option>
                <option value="Geolocation">Geolocation routing</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#eaeded] pt-5">
              <button
                onClick={() => setShowCreateModal(false)}
                className="border border-[#879596] px-4 py-2 text-sm font-medium text-[#161e2d] hover:bg-[#f2f3f3]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRecord}
                disabled={processing}
                className="bg-[#ff9900] px-5 py-2 text-sm font-semibold text-[#161e2d] hover:bg-[#ec7211]"
              >
                {processing ? "Creating..." : "Create record"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editingRecord && (
        <Modal title="Edit record" onClose={() => setEditingRecord(null)}>
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#161e2d]">Record name</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="www"
                  value={recordName}
                  onChange={(e) => setRecordName(e.target.value)}
                  className="flex-1 border border-[#879596] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0972ce]"
                />
                <span className="text-gray-500 text-sm">.{zone?.name}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#161e2d]">Record type</label>
                <select
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value)}
                  className="w-full border border-[#879596] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0972ce] bg-white"
                >
                  {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#161e2d]">TTL (Seconds)</label>
                <input
                  type="number"
                  value={recordTtl}
                  onChange={(e) => setRecordTtl(parseInt(e.target.value) || 0)}
                  className="w-full border border-[#879596] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0972ce]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#161e2d]">Value</label>
              <textarea
                value={recordValue}
                onChange={(e) => setRecordValue(e.target.value)}
                rows={3}
                className="w-full resize-none border border-[#879596] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0972ce]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#161e2d]">Routing policy</label>
              <select
                value={routingPolicy}
                onChange={(e) => setRoutingPolicy(e.target.value)}
                className="w-full border border-[#879596] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0972ce] bg-white"
              >
                <option value="Simple">Simple routing</option>
                <option value="Weighted">Weighted routing</option>
                <option value="Failover">Failover routing</option>
                <option value="Geolocation">Geolocation routing</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#eaeded] pt-5">
              <button
                onClick={() => setEditingRecord(null)}
                className="border border-[#879596] px-4 py-2 text-sm font-medium text-[#161e2d] hover:bg-[#f2f3f3]"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRecord}
                disabled={processing}
                className="bg-[#ff9900] px-5 py-2 text-sm font-semibold text-[#161e2d] hover:bg-[#ec7211]"
              >
                {processing ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {deletingRecord && (
        <Modal title="Delete record" onClose={() => setDeletingRecord(null)}>
          <div>
            <p className="text-sm leading-6 text-gray-700">
              Are you sure you want to delete the record <span className="font-semibold text-[#161e2d]">{deletingRecord.name}</span> of type <span className="font-semibold">{deletingRecord.record_type}</span>?
            </p>
            <p className="mt-3 text-sm text-red-600">This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3 border-t border-[#eaeded] pt-5">
              <button
                onClick={() => setDeletingRecord(null)}
                className="border border-[#879596] px-4 py-2 text-sm font-medium text-[#161e2d] hover:bg-[#f2f3f3]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRecord}
                disabled={processing}
                className="bg-[#d13212] px-5 py-2 text-sm font-semibold text-white hover:bg-[#a91f0c]"
              >
                {processing ? "Deleting..." : "Delete record"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
