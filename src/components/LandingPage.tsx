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
      <div className="max-w-6xl w-full h-full flex flex-col justify-center items-center">
        {/* Logo e Título - Seção Principal */}
        <div className="text-center mb-6 md:mb-8 flex-shrink-0">
          <ViaPlanLogo />
          <div className="mt-4 md:mt-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#f3eae0] mb-2 md:mb-3 tracking-tight">
              ViaPlan
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-[#d2c7b8] mb-3 md:mb-4 font-light">
              Sua Medição Técnica!
            </p>
            <p className="text-sm md:text-base lg:text-lg text-[#f3eae0]/80 max-w-2xl mx-auto leading-relaxed px-4">
              Ferramenta em desenvolvimento para medição e análise de projetos de
              infraestrutura
            </p>
          </div>
        </div>

        {/* Features - Ferramentas de Medição */}
        <div className="w-full max-w-5xl mb-5 md:mb-6 flex-shrink-0">
          <h2 className="text-lg md:text-xl font-semibold text-[#f3eae0] mb-4 text-center">
            Ferramentas de Medição
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-[#2f486d]/50 backdrop-blur-sm border border-[#3d5a7d] rounded-lg md:rounded-xl p-3 md:p-4 transition-all duration-300 hover:bg-[#2f486d]/70 hover:border-[#f3eae0]/30 hover:scale-105">
              <h3 className="text-sm md:text-base font-semibold text-[#f3eae0] mb-1">
                Distância (Régua)
              </h3>
              <p className="text-xs text-[#d2c7b8] leading-tight">
                Clicar em dois pontos e obter o comprimento. Padrão inicial.
              </p>
            </div>

            <div className="bg-[#2f486d]/50 backdrop-blur-sm border border-[#3d5a7d] rounded-lg md:rounded-xl p-3 md:p-4 transition-all duration-300 hover:bg-[#2f486d]/70 hover:border-[#f3eae0]/30 hover:scale-105">
              <h3 className="text-sm md:text-base font-semibold text-[#f3eae0] mb-1">
                Polilinha (Caminho)
              </h3>
              <p className="text-xs text-[#d2c7b8] leading-tight">
                Mede trajetos com vários segmentos. Ideal para redes e tubulações.
              </p>
            </div>

            <div className="bg-[#2f486d]/50 backdrop-blur-sm border border-[#3d5a7d] rounded-lg md:rounded-xl p-3 md:p-4 transition-all duration-300 hover:bg-[#2f486d]/70 hover:border-[#f3eae0]/30 hover:scale-105">
              <h3 className="text-sm md:text-base font-semibold text-[#f3eae0] mb-1">
                Área (Polígono)
              </h3>
              <p className="text-xs text-[#d2c7b8] leading-tight">
                Seleciona contorno e retorna área. Usado em pavimentos e lotes.
              </p>
            </div>

            <div className="bg-[#2f486d]/50 backdrop-blur-sm border border-[#3d5a7d] rounded-lg md:rounded-xl p-3 md:p-4 transition-all duration-300 hover:bg-[#2f486d]/70 hover:border-[#f3eae0]/30 hover:scale-105">
              <h3 className="text-sm md:text-base font-semibold text-[#f3eae0] mb-1">
                Contagem (Marcador)
              </h3>
              <p className="text-xs text-[#d2c7b8] leading-tight">
                Clicar e contar itens iguais. Postes, caixas, conexões, bueiros.
              </p>
            </div>

            <div className="bg-[#2f486d]/50 backdrop-blur-sm border border-[#3d5a7d] rounded-lg md:rounded-xl p-3 md:p-4 transition-all duration-300 hover:bg-[#2f486d]/70 hover:border-[#f3eae0]/30 hover:scale-105">
              <h3 className="text-sm md:text-base font-semibold text-[#f3eae0] mb-1">
                Perfil / Seção Transversal
              </h3>
              <p className="text-xs text-[#d2c7b8] leading-tight">
                Traça linha e gera perfil de terreno. Essencial para estradas e valas.
              </p>
            </div>

            <div className="bg-[#2f486d]/50 backdrop-blur-sm border border-[#3d5a7d] rounded-lg md:rounded-xl p-3 md:p-4 transition-all duration-300 hover:bg-[#2f486d]/70 hover:border-[#f3eae0]/30 hover:scale-105">
              <h3 className="text-sm md:text-base font-semibold text-[#f3eae0] mb-1">
                Volume por Profundidade
              </h3>
              <p className="text-xs text-[#d2c7b8] leading-tight">
                Define profundidade constante e gera volume. Uso em drenagem e saneamento.
              </p>
            </div>

            <div className="bg-[#2f486d]/50 backdrop-blur-sm border border-[#3d5a7d] rounded-lg md:rounded-xl p-3 md:p-4 transition-all duration-300 hover:bg-[#2f486d]/70 hover:border-[#f3eae0]/30 hover:scale-105">
              <h3 className="text-sm md:text-base font-semibold text-[#f3eae0] mb-1">
                Slope / Declividade
              </h3>
              <p className="text-xs text-[#d2c7b8] leading-tight">
                Mede inclinação entre dois pontos. Fundamental para drenagem e taludes.
              </p>
            </div>

            <div className="bg-[#2f486d]/50 backdrop-blur-sm border border-[#3d5a7d] rounded-lg md:rounded-xl p-3 md:p-4 transition-all duration-300 hover:bg-[#2f486d]/70 hover:border-[#f3eae0]/30 hover:scale-105">
              <h3 className="text-sm md:text-base font-semibold text-[#f3eae0] mb-1">
                Offset / Paralelo
              </h3>
              <p className="text-xs text-[#d2c7b8] leading-tight">
                Gera linhas paralelas a um eixo. Comum em rodovias e loteamentos.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button e Footer */}
        <div className="flex flex-col items-center gap-2 md:gap-3 flex-shrink-0">
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-[#2f486d] hover:bg-[#3d5a7d] text-[#f3eae0] border-2 border-[#3d5a7d] px-6 md:px-8 py-4 md:py-5 text-base md:text-lg font-semibold rounded-xl shadow-2xl hover:shadow-[#2f486d]/50 hover:scale-105 transition-all duration-300 group"
          >
            Vamos experimentar?
            <ArrowRight className="ml-2 md:ml-3 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-2 transition-transform" />
          </Button>
          <p className="text-xs md:text-sm text-[#d2c7b8]/70">
            Comece agora e transforme seus projetos em medições precisas
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

