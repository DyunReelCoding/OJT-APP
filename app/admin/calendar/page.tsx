"use client";

import { useEffect, useState } from "react";
import { Client, Databases } from "appwrite";
import SideBar from "@/components/SideBar";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Activity {
  $id: string;
  title: string;
  date: string;
  type: string;
}

const CalendarPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Initialize Appwrite Client
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);
  
  const databases = new Databases(client);

  useEffect(() => {
    fetchActivities();
  }, [currentDate]);

  const fetchActivities = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_ACTIVITIES_COLLECTION_ID!
      );
      setActivities(response.documents as Activity[]);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div 
          key={`empty-${i}`} 
          className="border border-blue-700 bg-blue-100 p-4 min-h-[100px]"
        />
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = currentDay.toISOString().split('T')[0];
      const isSelected = dateString === selectedDate;
      const dayActivities = activities.filter(activity => 
        new Date(activity.date).toDateString() === currentDay.toDateString()
      );

      days.push(
        <div 
          key={day}
          onClick={() => setSelectedDate(dateString)}
          className={`border border-blue-700 bg-white p-4 min-h-[100px] cursor-pointer transition-colors
            ${isSelected ? 'bg-blue-700 text-white' : 'hover:bg-blue-200'}`}
        >
          <span className="text-sm text-dark-200">{day}</span>
          {dayActivities.length > 0 && (
            <div className="mt-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SideBar />
      <div className="flex-1 p-6 overflow-hidden">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold text-blue-700">Calendar of Activities</h1>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4 text-blue-700" />
              </Button>
              <h2 className="text-lg font-medium text-blue-700 min-w-[200px] text-center">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4 text-blue-700" />
              </Button>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden border border-blue-700">
            <div className="grid grid-cols-7 bg-blue-700">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-4 text-center text-sm font-medium text-white">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {renderCalendar()}
            </div>
          </div>

          {selectedDate && (
            <div className="mt-6 p-4 rounded-lg bg-white border border-blue-700">
              <h3 className="text-sm font-medium text-dark-600">
                Activities for {selectedDate}
              </h3>
              {/* Activity list would go here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage; 