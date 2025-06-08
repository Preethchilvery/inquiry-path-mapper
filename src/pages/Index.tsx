
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FlowchartEditor } from "./FlowchartEditor";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  console.log('Index page - loading:', loading, 'user:', user?.email);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is logged in, show the flowchart editor
  if (user) {
    return <FlowchartEditor />;
  }

  // If user is not logged in, show the welcome page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Admin App
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Please sign in to access the flowchart editor and admin panel.
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/login')}
            className="w-full"
            size="lg"
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
