import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Calendar, Clock } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { getUserSchedule, updateUserSchedule } from "../../api/users.api";
import toast from "react-hot-toast";
import { Spinner } from "../ui/Spinner";

const DAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

const DaySchedule = ({ day, schedule, onChange }) => {
  const daySchedule = schedule.find((s) => s.day === day.value) || {
    day: day.value,
    startTime: "10:00",
    endTime: "19:00",
    isActive: true,
  };

  return (
    <div className="flex items-center gap-3 p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="w-24 text-sm font-medium text-gray-700">{day.label}</div>
      <div className="flex items-center gap-2 flex-1">
        <input
          type="time"
          value={daySchedule.startTime}
          onChange={(e) => onChange(day.value, "startTime", e.target.value)}
          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <span className="text-xs text-gray-400">to</span>
        <input
          type="time"
          value={daySchedule.endTime}
          onChange={(e) => onChange(day.value, "endTime", e.target.value)}
          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <button
        onClick={() => onChange(day.value, "isActive", !daySchedule.isActive)}
        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
          daySchedule.isActive
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
        }`}
      >
        {daySchedule.isActive ? "Active" : "Inactive"}
      </button>
    </div>
  );
};

export const ScheduleModal = ({ isOpen, onClose, userId, userName }) => {
  const queryClient = useQueryClient();
  const [schedule, setSchedule] = useState([]);
  const [restrictOutsideHours, setRestrictOutsideHours] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      fetchSchedule();
    }
  }, [isOpen, userId]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await getUserSchedule(userId);

      //  Better error handling with console logs
      console.log("Full response:", response);

      //  Check if response has data property
      if (response && response.data) {
        const data = response.data;
        console.log("Data from API:", data);

        setSchedule(data.schedule || []);
        setRestrictOutsideHours(
          data.restrictOutsideHours !== undefined
            ? data.restrictOutsideHours
            : true,
        );
      } else if (response && response.success !== undefined) {
        // If response is directly the data object (without wrapping)
        console.log("Direct data:", response);
        setSchedule(response.schedule || []);
        setRestrictOutsideHours(
          response.restrictOutsideHours !== undefined
            ? response.restrictOutsideHours
            : true,
        );
      } else {
        console.error("Unexpected response structure:", response);
        toast.error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      toast.error(error.response?.data?.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  const updateScheduleMutation = useMutation({
    mutationFn: (data) => updateUserSchedule(userId, data),
    onSuccess: () => {
      toast.success("Schedule updated successfully!");
      queryClient.invalidateQueries(["userSchedule", userId]);
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update schedule");
    },
  });

  const handleScheduleChange = (day, field, value) => {
    setSchedule((prev) => {
      const existing = prev.find((s) => s.day === day);
      if (existing) {
        return prev.map((s) => (s.day === day ? { ...s, [field]: value } : s));
      } else {
        return [
          ...prev,
          {
            day,
            startTime: "10:00",
            endTime: "19:00",
            isActive: true,
            [field]: value,
          },
        ];
      }
    });
  };

  const handleSave = async () => {
    await updateScheduleMutation.mutateAsync({
      schedule,
      restrictOutsideHours,
    });
  };

  if (loading) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Schedule Management"
        size="lg"
      >
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Schedule Management - ${userName || "User"}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Restriction Toggle */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Restrict Outside Office Hours
              </p>
              <p className="text-xs text-gray-600">
                Users can only login during scheduled working hours
              </p>
            </div>
          </div>
          <button
            onClick={() => setRestrictOutsideHours(!restrictOutsideHours)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              restrictOutsideHours
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {restrictOutsideHours ? "ON" : "OFF"}
          </button>
        </div>

        {/* Schedule */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Weekly Schedule
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {DAYS.map((day) => (
              <DaySchedule
                key={day.value}
                day={day}
                schedule={schedule}
                onChange={handleScheduleChange}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={updateScheduleMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateScheduleMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {updateScheduleMutation.isPending ? "Saving..." : "Save Schedule"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
