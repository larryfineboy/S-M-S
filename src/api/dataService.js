// Mock API service
export const fetchDashboardStats = async () => {
  console.log("Fetching dashboard stats...");
  return {
    Students: 520,
    Teachers: 34,
    Subjects: 24,
  };
};

export const fetchNotifications = async () => {
  console.log("Fetching notifications...");
  return [
    {
      id: 5,
      title: "New Event: Science Fair",
      content: "Join the science fair this Friday!",
      read: false,
    },
    {
      id: 4,
      title: "Exam Results Released",
      content: "Results for Term 1 exams are now available.",
      read: true,
    },
    {
      id: 3,
      title: "New Student Orientation",
      content: "Orientation will be held on Monday.",
      read: false,
    },
    {
      id: 2,
      title: "Exam Results Released",
      content: "Results for Term 2 exams are now available.",
      read: true,
    },
    {
      id: 1,
      title: "Exam Results Released",
      content: "Results for Term 3 exams are now available.",
      read: true,
    },
  ];
};

export const fetchAttendanceData = async (month) => {
  console.log(`Fetching attendance data for ${month}...`);
  return [
    { day: "Monday", attendance: 90 },
    { day: "Tuesday", attendance: 38 },
    { day: "Wednesday", attendance: 72 },
    { day: "Thursday", attendance: 97 },
    { day: "Friday", attendance: 112 },
    // etc.
  ];
};
