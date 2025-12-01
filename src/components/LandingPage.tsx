import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ruler, FileText, Zap } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/quick-takeoff");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#223148] via-[#2f486d] to-[#223148] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center">
        {/* Main Content */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-7xl font-bold text-[#f3eae0] mb-6 tracking-tight">
            ViaPlan
          </h1>
          <p className="text-2xl md:text-3xl text-[#d2c7b8] mb-4 font-light">
            Quick Takeoff
          </p>
          <p className="text-lg md:text-xl text-[#f3eae0]/80 max-w-2xl mx-auto mb-8">
            Ferramenta profissional para medição e análise de projetos de
            infraestrutura
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#2f486d]/50 backdrop-blur-sm border border-[#3d5a7d] rounded-lg p-6">
            <div className="w-12 h-12 bg-[#f3eae0]/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Ruler className="h-6 w-6 text-[#f3eae0]" />
            </div>
            <h3 className="text-lg font-semibold text-[#f3eae0] mb-2">
              Medições Precisas
            </h3>
            <p className="text-sm text-[#d2c7b8]">
              Ferramentas avançadas para medição de trincheiras, condutos e
              muito mais
            </p>
          </div>

          <div className="bg-[#2f486d]/50 backdrop-blur-sm border border-[#3d5a7d] rounded-lg p-6">
            <div className="w-12 h-12 bg-[#f3eae0]/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <FileText className="h-6 w-6 text-[#f3eae0]" />
            </div>
            <h3 className="text-lg font-semibold text-[#f3eae0] mb-2">
              Análise de PDFs
            </h3>
            <p className="text-sm text-[#d2c7b8]">
              Carregue seus projetos em PDF e comece a medir imediatamente
            </p>
          </div>

          <div className="bg-[#2f486d]/50 backdrop-blur-sm border border-[#3d5a7d] rounded-lg p-6">
            <div className="w-12 h-12 bg-[#f3eae0]/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Zap className="h-6 w-6 text-[#f3eae0]" />
            </div>
            <h3 className="text-lg font-semibold text-[#f3eae0] mb-2">
              Rápido e Intuitivo
            </h3>
            <p className="text-sm text-[#d2c7b8]">
              Interface moderna e fácil de usar para máxima produtividade
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-[#2f486d] hover:bg-[#3d5a7d] text-[#f3eae0] border border-[#3d5a7d] px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            Vamos experimentar?
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Footer Text */}
        <p className="mt-12 text-sm text-[#d2c7b8]/60">
          Comece agora e transforme seus projetos em medições precisas
        </p>
      </div>
    </div>
  );
};

export default LandingPage;

