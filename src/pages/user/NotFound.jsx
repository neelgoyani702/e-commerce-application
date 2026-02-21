import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="md:mt-24 mt-36">
      <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 text-center">
        {/* Big 404 */}
        <h1 className="text-[150px] md:text-[200px] font-black text-gray-100 leading-none select-none">
          404
        </h1>

        <div className="-mt-10 md:-mt-14">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            Page Not Found
          </h2>
          <p className="text-gray-500 max-w-md mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              className="gap-2 py-5"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button
              className="gap-2 py-5 bg-yellow-600 hover:bg-yellow-500"
              onClick={() => navigate("/")}
            >
              <Home className="h-4 w-4" />
              Home Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
