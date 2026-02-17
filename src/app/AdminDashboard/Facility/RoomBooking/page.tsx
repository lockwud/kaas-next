"use client";

import DashboardLayout from "@/components/DashboardLayout";

export default function RoomBookingPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Room Booking</h1>
                    <p className="text-gray-600 mt-2">Book and manage facility rooms</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-500">Room booking functionality coming soon...</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
