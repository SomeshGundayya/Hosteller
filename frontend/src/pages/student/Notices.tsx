import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { NoticeCard } from '@/components/dashboard/NoticeCard';
import { useState, useEffect } from "react";
import API from "@/lib/api";

export default function Notices() {

  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await API.get("/notices");
      setNotices(res.data);
    } catch (error) {
      console.log("Error fetching notices");
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Notices</h1>
        <p className="page-subtitle">
          Important announcements and updates from the hostel
        </p>
      </div>

      <div className="space-y-4">
        {notices.map((notice) => (
          <NoticeCard key={notice._id} notice={notice} />
        ))}
      </div>
    </DashboardLayout>
  );
}