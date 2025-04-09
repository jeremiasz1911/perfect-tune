import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FaPlus, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaMusic } from "react-icons/fa";

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  type: "class" | "workshop" | "performance" | "meeting";
  instructor: string;
  students?: number;
}

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetailsDialog, setShowEventDetailsDialog] = useState(false);
  const { toast } = useToast();

  // Mock calendar events
  const events: Event[] = [
    {
      id: "1",
      title: "Beginner Piano Class",
      date: new Date(),
      time: "10:00 AM - 11:30 AM",
      location: "Studio A",
      type: "class",
      instructor: "Sarah Johnson",
      students: 8
    },
    {
      id: "2",
      title: "Guitar Workshop",
      date: new Date(),
      time: "1:00 PM - 3:00 PM",
      location: "Studio B",
      type: "workshop",
      instructor: "David Miller",
      students: 12
    },
    {
      id: "3",
      title: "Student Recital",
      date: new Date(new Date().setDate(new Date().getDate() + 2)),
      time: "5:00 PM - 7:00 PM",
      location: "Main Hall",
      type: "performance",
      instructor: "Various"
    },
    {
      id: "4",
      title: "Staff Meeting",
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
      time: "9:00 AM - 10:00 AM",
      location: "Conference Room",
      type: "meeting",
      instructor: "Admin"
    }
  ];

  const filteredEvents = events.filter(
    (event) => 
      selectedDate && 
      event.date.getDate() === selectedDate.getDate() &&
      event.date.getMonth() === selectedDate.getMonth() &&
      event.date.getFullYear() === selectedDate.getFullYear()
  );

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleAddEvent = () => {
    // In a real app, this would add the event to the database
    toast({
      title: "Event Added",
      description: "The new event has been successfully added to the calendar.",
    });
    setShowAddEventDialog(false);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetailsDialog(true);
  };

  // Function to get the event badge color based on type
  const getEventBadgeVariant = (type: string) => {
    switch (type) {
      case "class":
        return "default";
      case "workshop":
        return "secondary";
      case "performance":
        return "outline";
      case "meeting":
        return "destructive";
      default:
        return "default";
    }
  };

  // Function to get event dates with events for highlighting in the calendar
  const getDatesWithEvents = () => {
    return events.map(event => event.date);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Calendar</h2>
          <p className="text-neutral-500">Manage classes, workshops and events</p>
        </div>
        
        <Button onClick={() => setShowAddEventDialog(true)} className="flex items-center gap-2">
          <FaPlus size={14} />
          <span>Add Event</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="border rounded-md p-4"
            />
            
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="w-3 h-3 p-0 rounded-full" />
                <span className="text-sm">Classes</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-3 h-3 p-0 rounded-full" />
                <span className="text-sm">Workshops</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-3 h-3 p-0 rounded-full" />
                <span className="text-sm">Performances</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="w-3 h-3 p-0 rounded-full" />
                <span className="text-sm">Meetings</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate && `Events for ${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEvents.length > 0 ? (
              <div className="space-y-4">
                {filteredEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-primary/10 text-primary`}>
                          <FaMusic className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-neutral-600">
                            <div className="flex items-center gap-1">
                              <FaClock className="h-3 w-3" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaMapMarkerAlt className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaUsers className="h-3 w-3" />
                              <span>{event.instructor}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Badge variant={getEventBadgeVariant(event.type) as any}>
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FaCalendarAlt className="h-12 w-12 text-neutral-300 mb-4" />
                <h3 className="text-lg font-medium text-neutral-700">No events scheduled</h3>
                <p className="text-neutral-500 mt-1 max-w-md">
                  There are no events scheduled for this date. Click the "Add Event" button to create a new event.
                </p>
                <Button 
                  onClick={() => setShowAddEventDialog(true)} 
                  className="mt-4"
                >
                  Add Event
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Add Event Dialog */}
      <Dialog open={showAddEventDialog} onOpenChange={setShowAddEventDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new event, class or workshop
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Event Title</Label>
                <Input id="title" placeholder="Enter event title" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" defaultValue={selectedDate?.toISOString().split('T')[0]} />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" placeholder="e.g., 1:00 PM - 2:30 PM" />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Enter location" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="type">Event Type</Label>
                <select 
                  id="type" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="class">Class</option>
                  <option value="workshop">Workshop</option>
                  <option value="performance">Performance</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="instructor">Instructor/Host</Label>
                <Input id="instructor" placeholder="Enter instructor or host name" />
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setShowAddEventDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleAddEvent}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Event Details Dialog */}
      <Dialog open={showEventDetailsDialog} onOpenChange={setShowEventDetailsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{selectedEvent.title}</h3>
                <Badge variant={getEventBadgeVariant(selectedEvent.type) as any}>
                  {selectedEvent.type}
                </Badge>
              </div>
              
              <div className="grid gap-2">
                <div className="flex items-center text-neutral-700">
                  <FaCalendarAlt className="mr-2" />
                  <span>{selectedEvent.date.toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center text-neutral-700">
                  <FaClock className="mr-2" />
                  <span>{selectedEvent.time}</span>
                </div>
                
                <div className="flex items-center text-neutral-700">
                  <FaMapMarkerAlt className="mr-2" />
                  <span>{selectedEvent.location}</span>
                </div>
                
                <div className="flex items-center text-neutral-700">
                  <FaUsers className="mr-2" />
                  <span>Instructor: {selectedEvent.instructor}</span>
                </div>
                
                {selectedEvent.students && (
                  <div className="flex items-center text-neutral-700">
                    <FaUsers className="mr-2" />
                    <span>{selectedEvent.students} students enrolled</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setShowEventDetailsDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowEventDetailsDialog(false);
              toast({
                title: "Reminder Set",
                description: "You will be notified before this event.",
              });
            }}>
              Set Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarView;