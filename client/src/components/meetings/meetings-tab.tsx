import { useState } from "react";
import { Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMeetings } from "@/hooks/use-meetings";
import { useClients } from "@/hooks/use-clients";
import { MeetingForm } from "./meeting-form";
import type { Meeting } from "@shared/schema";

export function MeetingsTab() {
  const { meetings, isLoading, createMeeting, updateMeeting, deleteMeeting } = useMeetings();
  const { clients } = useClients();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const getClientName = (clientId: number | null) => {
    if (!clientId) return "External Client";
    const client = clients?.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
  };

  const handleDeleteMeeting = async (id: number) => {
    if (confirm("Are you sure you want to delete this meeting?")) {
      await deleteMeeting.mutateAsync(id);
    }
  };

  const upcomingMeetings = meetings?.filter(meeting => {
    const meetingDate = new Date(meeting.scheduledAt);
    return meetingDate > new Date() && meeting.status === "scheduled";
  }).slice(0, 5) || [];

  // Simple calendar generation
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();
  
  const getMeetingsForDate = (date: Date) => {
    return meetings?.filter(meeting => {
      const meetingDate = new Date(meeting.scheduledAt);
      return meetingDate.toDateString() === date.toDateString();
    }) || [];
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meeting Scheduler</h2>
          <p className="text-gray-600 mt-1">Schedule and manage meetings with clients</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Schedule Meeting</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Meeting</DialogTitle>
            </DialogHeader>
            <MeetingForm
              onSubmit={async (data) => {
                await createMeeting.mutateAsync(data);
                setIsAddDialogOpen(false);
              }}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                  ←
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                  →
                </Button>
              </div>
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const isToday = date.toDateString() === today.toDateString();
                const dayMeetings = getMeetingsForDate(date);
                
                return (
                  <div
                    key={index}
                    className={`aspect-square p-2 text-center text-sm relative cursor-pointer hover:bg-gray-50 ${
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    } ${isToday ? 'bg-primary text-white rounded' : ''}`}
                  >
                    {date.getDate()}
                    {dayMeetings.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Upcoming Meetings</h3>
            {upcomingMeetings.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming meetings scheduled.</p>
            ) : (
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                        <p className="text-sm text-gray-600">
                          {meeting.clientId ? getClientName(meeting.clientId) : meeting.externalClientName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(meeting.scheduledAt).toLocaleDateString()} at{" "}
                          {new Date(meeting.scheduledAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEditMeeting(meeting)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteMeeting(meeting.id)}
                            className="text-red-600"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Meeting Dialog */}
      <Dialog open={!!editingMeeting} onOpenChange={(open) => !open && setEditingMeeting(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
          </DialogHeader>
          {editingMeeting && (
            <MeetingForm
              initialData={editingMeeting}
              onSubmit={async (data) => {
                await updateMeeting.mutateAsync({ id: editingMeeting.id, data });
                setEditingMeeting(null);
              }}
              onCancel={() => setEditingMeeting(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
