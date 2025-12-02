import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github } from "lucide-react";
import ViaPlanLogo from "@/components/ViaPlanLogo";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/quick-takeoff");
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#223148] via-[#2f486d] to-[#223148] flex flex-col p-4 md:p-6 relative overflow-y-auto">
      <div className="max-w-4xl w-full flex flex-col justify-center items-center py-8 md:py-12 mx-auto flex-1">
        {/* Logo e Título */}
        <div className="text-center mb-8 md:mb-12">
          <ViaPlanLogo />
          <div className="mt-6 md:mt-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#f3eae0] mb-3 md:mb-4 tracking-tight">
              ViaPlan
            </h1>
            <p className="text-base md:text-lg text-[#d2c7b8] mb-4 md:mb-6 font-light">
              Sua ferramenta para medição e análise de projetos de
              infraestrutura
            </p>
          </div>
        </div>

        {/* Informações Básicas */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
          {/* Para que funciona */}
          <div className="bg-[#2f486d]/40 backdrop-blur-sm border border-[#3d5a7d] rounded-lg p-3 md:p-4">
            <h2 className="text-sm md:text-base font-semibold text-[#f3eae0] mb-2">
              Para que funciona?
            </h2>
            <p className="text-xs md:text-sm text-[#d2c7b8] leading-relaxed">
              Ferramenta para medições técnicas em projetos de infraestrutura.
              Ideal para medir trincheiras, perfurações, condutos, áreas e
              volumes em plantas técnicas.
            </p>
          </div>

          {/* Como funciona */}
          <div className="bg-[#2f486d]/40 backdrop-blur-sm border border-[#3d5a7d] rounded-lg p-3 md:p-4">
            <h2 className="text-sm md:text-base font-semibold text-[#f3eae0] mb-2">
              Como funciona?
            </h2>
            <ol className="list-decimal list-inside space-y-1 text-xs md:text-sm text-[#d2c7b8]">
              <li>Faça upload do PDF</li>
              <li>Selecione a ferramenta</li>
              <li>Configure e meça</li>
              <li>Exporte os resultados</li>
            </ol>
          </div>

          {/* Sobre o Projeto */}
          <div className="bg-[#2f486d]/40 backdrop-blur-sm border border-[#3d5a7d] rounded-lg p-3 md:p-4 md:col-span-2 lg:col-span-1">
            <h2 className="text-sm md:text-base font-semibold text-[#f3eae0] mb-2">
              Sobre o Projeto
            </h2>
            <p className="text-xs md:text-sm text-[#d2c7b8] leading-relaxed">
              Projeto desenvolvido para fins estudantis e evolução profissional.
              Caso encontre algo a ser melhorado ou ajustado, por favor não
              hesite em entrar em contato!
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

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 py-4 px-4 md:px-6 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <a
            href="https://github.com/biancaalvess"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 text-xs md:text-sm text-[#d2c7b8]/80 hover:text-[#f3eae0] transition-colors duration-200 group mx-auto"
          >
            <span className="text-[#d2c7b8]/60">Desenvolvido por</span>
            <Github className="h-3 w-3 md:h-4 md:w-4 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Bianca Alves</span>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
