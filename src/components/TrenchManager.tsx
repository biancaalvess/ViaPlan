import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "./ProtectedRoute";

interface TrenchParameters {
  id: string;
  name: string;
  description: string;
  category: string;
  width: number;
  depth: number;
  length: number;
  soilType: string;
  groundwaterLevel: number;
  slope: number;
  liningType: string;
  material: string;
  costPerMeter: number;
  laborHours: number;
  equipment: string[];
  safetyFactors: any[];
  complianceStandards: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TrenchOptions {
  categories: { value: string; label: string }[];
  soilTypes: { value: string; label: string }[];
  liningTypes: { value: string; label: string }[];
  materialTypes: { value: string; label: string }[];
}

const TrenchManager: React.FC = () => {
  const [trenches, setTrenches] = useState<TrenchParameters[]>([]);
  const [options, setOptions] = useState<TrenchOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrench, setSelectedTrench] = useState<TrenchParameters | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    width: 0.6,
    depth: 1.2,
    length: 100,
    soilType: "",
    groundwaterLevel: 2.0,
    slope: 45,
    liningType: "",
    material: "",
    costPerMeter: 150.0,
    laborHours: 2.5,
    equipment: [""],
    safetyFactors: [] as any[],
    complianceStandards: [""],
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadTrenches();
    loadOptions();
  }, []);

  const loadTrenches = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/trenches", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("viaplan_access_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTrenches(data.data || []);
      } else {
        setError("Erro ao carregar trincheiras");
      }
    } catch (err) {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const response = await fetch("/api/trenches/options", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("viaplan_access_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOptions(data.data);
      }
    } catch (err) {
      console.error("Erro ao carregar opções:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = selectedTrench
        ? `/api/trenches/${selectedTrench.id}`
        : "/api/trenches";

      const method = selectedTrench ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("viaplan_access_token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadTrenches();
        resetForm();
        setShowForm(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Erro ao salvar trincheira");
      }
    } catch (err) {
      setError("Erro de conexão");
    }
  };

  const handleEdit = (trench: TrenchParameters) => {
    setSelectedTrench(trench);
    setFormData({
      name: trench.name,
      description: trench.description,
      category: trench.category,
      width: trench.width,
      depth: trench.depth,
      length: trench.length,
      soilType: trench.soilType,
      groundwaterLevel: trench.groundwaterLevel,
      slope: trench.slope,
      liningType: trench.liningType,
      material: trench.material,
      costPerMeter: trench.costPerMeter,
      laborHours: trench.laborHours,
      equipment: trench.equipment.length > 0 ? trench.equipment : [""],
      safetyFactors: trench.safetyFactors,
      complianceStandards:
        trench.complianceStandards.length > 0
          ? trench.complianceStandards
          : [""],
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja desativar esta trincheira?")) return;

    try {
      const response = await fetch(`/api/trenches/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("viaplan_access_token")}`,
        },
      });

      if (response.ok) {
        await loadTrenches();
      } else {
        setError("Erro ao desativar trincheira");
      }
    } catch (err) {
      setError("Erro de conexão");
    }
  };

  const resetForm = () => {
    setSelectedTrench(null);
    setFormData({
      name: "",
      description: "",
      category: "",
      width: 0.6,
      depth: 1.2,
      length: 100,
      soilType: "",
      groundwaterLevel: 2.0,
      slope: 45,
      liningType: "",
      material: "",
      costPerMeter: 150.0,
      laborHours: 2.5,
      equipment: [""],
      safetyFactors: [] as any[],
      complianceStandards: [""],
    });
  };

  const addEquipment = () => {
    setFormData((prev) => ({
      ...prev,
      equipment: [...prev.equipment, ""],
    }));
  };

  const removeEquipment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index),
    }));
  };

  const updateEquipment = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.map((item, i) => (i === index ? value : item)),
    }));
  };

  const addComplianceStandard = () => {
    setFormData((prev) => ({
      ...prev,
      complianceStandards: [...prev.complianceStandards, ""],
    }));
  };

  const removeComplianceStandard = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      complianceStandards: prev.complianceStandards.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const updateComplianceStandard = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      complianceStandards: prev.complianceStandards.map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="engineer">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">
                  Gerenciador de Trincheiras
                </h1>
                <p className="text-blue-100 mt-2">
                  Gerencie parâmetros, dimensões e especificações técnicas de
                  trincheiras
                </p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Nova Trincheira
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      onClick={() => setError(null)}
                      className="text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            {showForm && (
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  {selectedTrench ? "Editar Trincheira" : "Nova Trincheira"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Informações Básicas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoria *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Selecione uma categoria</option>
                        {options?.categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Dimensões */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Largura (m) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.3"
                        max="10.0"
                        value={formData.width}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            width: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profundidade (m) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="20.0"
                        value={formData.depth}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            depth: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comprimento (m) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1.0"
                        max="10000.0"
                        value={formData.length}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            length: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Especificações Técnicas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Solo *
                      </label>
                      <select
                        value={formData.soilType}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            soilType: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Selecione o tipo de solo</option>
                        {options?.soilTypes.map((soil) => (
                          <option key={soil.value} value={soil.value}>
                            {soil.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lençol Freático (m) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="50"
                        value={formData.groundwaterLevel}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            groundwaterLevel: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Inclinação (°) *
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="90"
                        value={formData.slope}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            slope: parseInt(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Materiais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Revestimento *
                      </label>
                      <select
                        value={formData.liningType}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            liningType: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">
                          Selecione o tipo de revestimento
                        </option>
                        {options?.liningTypes.map((lining) => (
                          <option key={lining.value} value={lining.value}>
                            {lining.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Material Principal *
                      </label>
                      <select
                        value={formData.material}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            material: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Selecione o material</option>
                        {options?.materialTypes.map((material) => (
                          <option key={material.value} value={material.value}>
                            {material.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Custos e Recursos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custo por Metro (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.costPerMeter}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            costPerMeter: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Horas de Trabalho *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={formData.laborHours}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            laborHours: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Equipamentos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipamentos Necessários *
                    </label>
                    {formData.equipment.map((equipment, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={equipment}
                          onChange={(e) =>
                            updateEquipment(index, e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nome do equipamento"
                          required
                        />
                        {formData.equipment.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEquipment(index)}
                            className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addEquipment}
                      className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      + Adicionar Equipamento
                    </button>
                  </div>

                  {/* Normas de Conformidade */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Normas de Conformidade
                    </label>
                    {formData.complianceStandards.map((standard, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={standard}
                          onChange={(e) =>
                            updateComplianceStandard(index, e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: NBR 5410, NR-18"
                        />
                        {formData.complianceStandards.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeComplianceStandard(index)}
                            className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addComplianceStandard}
                      className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      + Adicionar Norma
                    </button>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
                    >
                      {selectedTrench ? "Atualizar" : "Criar"} Trincheira
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                      className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lista de Trincheiras */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">
                  Trincheiras Cadastradas ({trenches.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dimensões
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Solo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Custo/m
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {trenches.map((trench) => (
                      <tr key={trench.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {trench.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {trench.description.substring(0, 50)}...
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {trench.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {trench.width}m × {trench.depth}m × {trench.length}m
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {trench.soilType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R$ {trench.costPerMeter.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(trench)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(trench.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Desativar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {trenches.length === 0 && (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Nenhuma trincheira encontrada
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comece criando uma nova trincheira para definir parâmetros e
                    especificações técnicas.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        resetForm();
                        setShowForm(true);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Nova Trincheira
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TrenchManager;
