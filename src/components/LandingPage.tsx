import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ViaPlanLogo from "@/components/ViaPlanLogo";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/quick-takeoff");
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#223148] via-[#2f486d] to-[#223148] flex items-center justify-center p-4 md:p-6 overflow-hidden">
      <div className="max-w-4xl w-full flex flex-col justify-center items-center">
        {/* Logo e Título */}
        <div className="text-center mb-8 md:mb-12">
          <ViaPlanLogo />
          <div className="mt-6 md:mt-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#f3eae0] mb-3 md:mb-4 tracking-tight">
              ViaPlan
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-[#d2c7b8] mb-6 md:mb-8 font-light">
              Sua Medição Técnica!
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col items-center">
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-[#2f486d] hover:bg-[#3d5a7d] text-[#f3eae0] border-2 border-[#3d5a7d] px-8 md:px-10 py-5 md:py-6 text-lg md:text-xl font-semibold rounded-xl shadow-2xl hover:shadow-[#2f486d]/50 hover:scale-105 transition-all duration-300 group"
          >
            Vamos experimentar?
            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

