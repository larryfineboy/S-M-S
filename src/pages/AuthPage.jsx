import React, { useState } from "react";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";
import loginPhoto from "../ui/loginPhoto.png";
import BTS from "../ui/BTS.jpg";
import { RectangleEllipsis } from "lucide-react";

const AuthPage = () => {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <div
      className={`min-h-screen items-center justify-center p-4 ${
        window.innerWidth >= 768 ? "flex" : "flex flex-col"
      }`}
      style={{ backgroundImage: `url(${BTS})` }}
    >
      <div
        className={`text-violet-500 w-full max-w-xl max-h-screen flex items-center justify-center ${
          window.innerWidth >= 768 ? "border-r-4" : ""
        }`}
      >
        <img
          src={loginPhoto}
          alt="student"
          className="w-full h-full object-contain p-8"
        />
      </div>
      <div
        className={`shadow-md rounded-lg p-6 w-full max-w-sm backdrop-blur-lg border-1 border-gray-400 ${
          window.innerWidth >= 768 ? "bg-violet/40 ml-6" : "bg-violet-100"
        }`}
      >
        <h2 className="text-2xl font-bold text-center text-violet-700 mb-4 flex gap-2 items-center justify-center">
          <RectangleEllipsis size={18} />
          {isSignup ? "Application Form" : "Login"}
        </h2>

        {isSignup ? <SignupForm /> : <LoginForm />}

        <p className="mt-6 text-center text-sm text-gray-600 font-semibold">
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-violet-600 font-semibold hover:underline cursor-pointer"
          >
            {isSignup ? "Login" : "Apply Here"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
