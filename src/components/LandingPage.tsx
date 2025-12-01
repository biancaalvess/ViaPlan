import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ruler, FileText, Zap } from "lucide-react";
import ViaPlanLogo from "@/components/ViaPlanLogo";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/quick-takeoff");
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#223148] via-[#2f486d] to-[#223148] flex items-center justify-center p-4 md:p-6 overflow-hidden">
      <div className="max-w-6xl w-full text-center h-full flex flex-col justify-center">
        {/* Main Content */}
        <div className="mb-4 md:mb-6">
          <ViaPlanLogo />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#f3eae0] mb-2 md:mb-3 tracking-tight">
            ViaPlan
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-[#d2c7b8] mb-3 md:mb-4 font-light">
            Quick Takeoff
          </p>
          <p className="text-sm md:text-base lg:text-lg text-[#f3eae0]/80 max-w-2xl mx-auto leading-tight">
            Ferramenta profissional para medição e análise de projetos de
            infraestrutura
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-[#2f486d]/50 backdrop-blur-sm border border-[#3d5a7d] rounded-lg md:rounded-xl p-4 md:p-5 transition-all duration-300 hover:bg-[#2f486d]/70 hover:border-[#f3eae0]/30 hover:scale-105">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#f3eae0]/20 rounded-lg md:rounded-xl flex items-center justify-center mb-3 mx-auto">
              <Ruler className="h-5 w-5 md:h-6 md:w-6 text-[#f3eae0]" />
            </div>
            <h3 className="text-sm md:text-base lg:text-lg font-semibold text-[#f3eae0] mb-2">
              Medições Precisas
            </h3>
            <p className="text-xs md:text-sm text-[#d2c7b8] leading-tight">
              Ferramentas avançadas para medição de trincheiras, condutos e
              muito mais
            </p>
          </div>

          <div className="bg-[#2f486d]/50 backdrop-blur-sm border border-[#3d5a7d] rounded-lg md:rounded-xl p-4 md:p-5 transition-all duration-300 hover:bg-[#2f486d]/70 hover:border-[#f3eae0]/30 hover:scale-105">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#f3eae0]/20 rounded-lg md:rounded-xl flex items-center justify-center mb-3 mx-auto">
              <FileText className="h-5 w-5 md:h-6 md:w-6 text-[#f3eae0]" />
            </div>
            <h3 className="text-sm md:text-base lg:text-lg font-semibold text-[#f3eae0] mb-2">
              Análise de PDFs
            </h3>
            <p className="text-xs md:text-sm text-[#d2c7b8] leading-tight">
              Carregue seus projetos em PDF e comece a medir imediatamente
            </p>
          </div>

          <div className="bg-[#2f486d]/50 backdrop-blur-sm border border-[#3d5a7d] rounded-lg md:rounded-xl p-4 md:p-5 transition-all duration-300 hover:bg-[#2f486d]/70 hover:border-[#f3eae0]/30 hover:scale-105">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#f3eae0]/20 rounded-lg md:rounded-xl flex items-center justify-center mb-3 mx-auto">
              <Zap className="h-5 w-5 md:h-6 md:w-6 text-[#f3eae0]" />
            </div>
            <h3 className="text-sm md:text-base lg:text-lg font-semibold text-[#f3eae0] mb-2">
              Rápido e Intuitivo
            </h3>
            <p className="text-xs md:text-sm text-[#d2c7b8] leading-tight">
              Interface moderna e fácil de usar para máxima produtividade
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mb-3 md:mb-4">
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-[#2f486d] hover:bg-[#3d5a7d] text-[#f3eae0] border-2 border-[#3d5a7d] px-6 md:px-8 py-4 md:py-5 text-base md:text-lg font-semibold rounded-xl shadow-2xl hover:shadow-[#2f486d]/50 hover:scale-105 transition-all duration-300 group"
          >
            Vamos experimentar?
            <ArrowRight className="ml-2 md:ml-3 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>

        {/* Footer Text */}
        <p className="text-xs md:text-sm text-[#d2c7b8]/70">
          Comece agora e transforme seus projetos em medições precisas
        </p>
      </div>
    </div>
  );
};

export default LandingPage;

