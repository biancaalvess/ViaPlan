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
    <div className="h-screen bg-gradient-to-br from-[#223148] via-[#2f486d] to-[#223148] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="max-w-4xl w-full flex flex-col justify-center items-center py-8 md:py-12">
        {/* Logo e Título */}
        <div className="text-center mb-8 md:mb-12">
          <ViaPlanLogo />
          <div className="mt-6 md:mt-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#f3eae0] mb-3 md:mb-4 tracking-tight">
              ViaPlan
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-[#d2c7b8] mb-2 md:mb-3 font-light">
              Bem-vindo!
            </p>
            <p className="text-base md:text-lg text-[#f3eae0]/80 mb-8 md:mb-10 max-w-2xl mx-auto">
              Sua ferramenta profissional para medição e análise de projetos de infraestrutura
            </p>
          </div>
        </div>

        {/* Informações Básicas */}
        <div className="w-full max-w-3xl space-y-6 md:space-y-8 mb-8 md:mb-12">
          {/* Para que funciona */}
          <div className="bg-[#2f486d]/40 backdrop-blur-sm border border-[#3d5a7d] rounded-lg md:rounded-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-[#f3eae0] mb-2 md:mb-3">
              Para que funciona?
            </h2>
            <p className="text-sm md:text-base text-[#d2c7b8] leading-relaxed">
              O ViaPlan é uma ferramenta especializada para realizar medições técnicas em projetos de infraestrutura. 
              Ideal para engenheiros, arquitetos e profissionais que precisam medir trincheiras, perfurações direcionais, 
              condutos, áreas, volumes e outros elementos em plantas e projetos técnicos.
            </p>
          </div>

          {/* Como funciona */}
          <div className="bg-[#2f486d]/40 backdrop-blur-sm border border-[#3d5a7d] rounded-lg md:rounded-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-[#f3eae0] mb-2 md:mb-3">
              Como funciona?
            </h2>
            <p className="text-sm md:text-base text-[#d2c7b8] leading-relaxed mb-3 md:mb-4">
              É simples e intuitivo:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-[#d2c7b8] ml-2">
              <li>Faça upload do seu PDF ou plano técnico</li>
              <li>Selecione a ferramenta de medição desejada</li>
              <li>Configure os parâmetros específicos da medição</li>
              <li>Desenhe e meça diretamente no plano</li>
              <li>Exporte os resultados para análise</li>
            </ol>
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
