import React from "react";
import {
  X,
  User,
  Calendar,
  BookOpen,
  Mail,
  Phone,
  PencilRuler,
  GraduationCap,
} from "lucide-react";

const UserProfileModal = ({ user, type = "student", onClose }) => {
  const isStudent = type === "student";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg relative shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-purple-700">
            {isStudent ? "Student Profile" : "Teacher Profile"}
          </h2>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            <X />
          </button>
        </div>

        <div className="space-y-4 text-purple-800">
          <div className="flex items-center gap-4">
            {user.image ? (
              <img
                src={URL.createObjectURL(user.image)}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
              />
            ) : (
              <User className="w-10 h-10 text-purple-600" />
            )}

            <div>
              <p className="font-bold">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-purple-500">
                {isStudent ? user.studentId : user.teacherId}
              </p>
            </div>
          </div>

          {type == "student" ? (
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              <span>STUDENT</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <PencilRuler className="w-5 h-5 text-purple-600" />
              <span>TEACHER</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-purple-600" />
            <span>{user.email}</span>
          </div>

          {isStudent ? (
            <>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span>Class: {user.className}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Date of Birth: {user.dateOfBirth}</span>
              </div>
              <div>
                <h4 className="font-semibold text-purple-600 mb-1">
                  Parent Info
                </h4>
                <div className="ml-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-purple-600" />
                    <span>{user.parentMobile}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-600" />
                    <span>{user.parentEmail}</span>
                  </div>
                  {user.parentSocial && (
                    <a
                      href={user.parentSocial}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-3 py-1 mt-1 text-white bg-purple-500 rounded hover:bg-purple-600 text-sm"
                    >
                      Visit Profile
                    </a>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span>Assigned Class: {user.assignedClass}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            <span
              className={`font-bold px-2 py-1 rounded text-white text-sm ${
                user.isActive ? "bg-green-500" : "bg-red-400"
              }`}
            >
              {user.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
