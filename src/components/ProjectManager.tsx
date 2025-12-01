'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Building,
  MapPin,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Flag,
  User,
  Save,
  X,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ProjectForm } from './ProjectForm';
import { TeamManager } from './TeamManager';

import projectService, { CreateProjectData } from '../services/projectService';
import { useApiConnectivity } from '../hooks/useApiConnectivity';
import { ProjectOfflineStore } from '../services/offlineStore';
import { apiService } from '../services/apiService';
import { API_CONFIG } from '../config/api';

export interface Project {
  id: string;
  name: string;
  description: string;
  client: string;
  location: string;
  status:
    | 'planning'
    | 'in-progress'
    | 'review'
    | 'completed'
    | 'cancelled'
    | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  endDate: string;
  proposalDeadline?: string;
  proposalNumber?: string;
  budget: number;
  estimatedValue: number;
  actualCost: number;
  progress: number;
  manager: string;
  team?: TeamMember[];
  tags?: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  files?: ProjectFile[];
  tasks?: ProjectTask[];
  milestones?: Milestone[];
  isArchived?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  hourlyRate: number;
  hoursAllocated: number;
  hoursWorked: number;
  avatar?: string;
  isActive: boolean;
}

export interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  category: 'drawing' | 'document' | 'photo' | 'other';
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  dependencies: string[];
  tags: string[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'delayed';
  progress: number;
  tasks: string[];
}

export function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [managerFilter, setManagerFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'kanban'>(
    'cards'
  );
  const [sortBy, setSortBy] = useState<
    'name' | 'startDate' | 'endDate' | 'progress' | 'budget'
  >('startDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTeamManager, setShowTeamManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);

  // Novos estados para conectividade e offline
  const connectivity = useApiConnectivity(API_CONFIG.baseURL);
  const [offlineStore] = useState(() => new ProjectOfflineStore());
  const [syncStatus, setSyncStatus] = useState<
    'idle' | 'syncing' | 'success' | 'error'
  >('idle');

  // Carregar projetos ao inicializar
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Carregando projetos...');

      if (connectivity.isConnected) {
        console.log('🌐 Conectado - carregando do servidor...');

        try {
          // Carregar do servidor
          const backendResponse = await apiService.get('/projects');
          const serverProjects = Array.isArray(backendResponse)
            ? backendResponse
            : backendResponse.data || [];

          setProjects(serverProjects);

          // Salvar no cache offline
          offlineStore.saveData(serverProjects);

          // Sincronizar ações pendentes
          await syncPendingActions();

          console.log(
            `✅ ${serverProjects.length} projetos carregados do servidor`
          );
        } catch (serverError) {
          console.error('❌ Erro ao carregar do servidor:', serverError);
          await loadFromOfflineStore();
        }
      } else {
        console.log('🔴 Offline - carregando do cache local...');
        await loadFromOfflineStore();
      }
    } catch (error) {
      console.error('❌ Erro ao carregar projetos:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Erro ao carregar projetos. Verifique sua conexão.'
      );

      // Tentar fallback final para localStorage
      try {
        const fallbackProjects = projectService.loadProjectsFromLocalStorage();
        setProjects(fallbackProjects);
        console.log(`⚠️ Usando fallback: ${fallbackProjects.length} projetos`);
      } catch (fallbackError) {
        console.error('❌ Fallback também falhou:', fallbackError);
        setProjects([]);
      }
    } finally {
      setLoading(false);
    }
  }, [connectivity.isConnected, offlineStore, apiService]);

  // Carregar dados do store offline
  const loadFromOfflineStore = useCallback(async () => {
    try {
      const offlineProjects = offlineStore.loadData();
      if (offlineProjects && Array.isArray(offlineProjects)) {
        setProjects(offlineProjects);
        console.log(
          `📦 ${offlineProjects.length} projetos carregados do cache offline`
        );
      } else {
        // Fallback para projectService se offlineStore estiver vazio
        const fallbackProjects = projectService.loadProjectsFromLocalStorage();
        setProjects(fallbackProjects);
        console.log(
          `📋 ${fallbackProjects.length} projetos carregados do fallback`
        );
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados offline:', error);
      setProjects([]);
    }
  }, [offlineStore]);

  // Sincronizar ações pendentes quando reconectar
  const syncPendingActions = useCallback(async () => {
    try {
      setSyncStatus('syncing');
      console.log('🔄 Sincronizando ações pendentes...');

      const result = await offlineStore.syncProjects(apiService);

      if (result.success && result.processedActions > 0) {
        console.log(
          `✅ ${result.processedActions} ações sincronizadas com sucesso`
        );
        setSyncStatus('success');

        // Recarregar projetos após sincronização
        setTimeout(() => {
          loadProjects();
        }, 1000);
      } else if (result.failedActions > 0) {
        console.warn(
          `⚠️ ${result.failedActions} ações falharam na sincronização`
        );
        setSyncStatus('error');
      } else {
        setSyncStatus('idle');
      }
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      setSyncStatus('error');
    }

    // Resetar status após alguns segundos
    setTimeout(() => setSyncStatus('idle'), 3000);
  }, [offlineStore, apiService]);

  // Recarregar quando conectividade mudar
  useEffect(() => {
    if (connectivity.isConnected) {
      console.log('🟢 Conectividade restaurada - recarregando projetos...');
      loadProjects();
    }
  }, [connectivity.isConnected, loadProjects]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = projects.filter(project => {
      const matchesSearch =
        searchTerm === '' ||
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        statusFilter === 'all' || project.status === statusFilter;
      const matchesPriority =
        priorityFilter === 'all' || project.priority === priorityFilter;
      const matchesManager =
        managerFilter === 'all' || project.manager === managerFilter;

      return (
        matchesSearch && matchesStatus && matchesPriority && matchesManager
      );
    });

    // Aplicar ordenação
    filtered.sort((a, b) => {
      let valueA, valueB;

      switch (sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'startDate':
          valueA = new Date(a.startDate).getTime();
          valueB = new Date(b.startDate).getTime();
          break;
        case 'endDate':
          valueA = new Date(a.endDate).getTime();
          valueB = new Date(b.endDate).getTime();
          break;
        case 'progress':
          valueA = a.progress;
          valueB = b.progress;
          break;
        case 'budget':
          valueA = a.budget;
          valueB = b.budget;
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });

    setFilteredProjects(filtered);
  }, [
    projects,
    searchTerm,
    statusFilter,
    priorityFilter,
    managerFilter,
    sortBy,
    sortOrder,
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'on-hold':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-yellow-100 text-yellow-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning':
        return 'Planning';
      case 'in-progress':
        return 'In Progress';
      case 'review':
        return 'In Review';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'on-hold':
        return 'On Hold';
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'Low';
      case 'medium':
        return 'Medium';
      case 'high':
        return 'High';
      case 'urgent':
        return 'Urgent';
      default:
        return priority;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US');
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCreateProject = async (projectData: Partial<Project>) => {
    try {
      setLoading(true);
      setError(null);

      const newProjectData: CreateProjectData = {
        name: projectData.name || '',
        description: projectData.description || '',
        client: projectData.client || '',
        location: projectData.location || '',
        status: projectData.status || 'planning',
        priority: projectData.priority || 'medium',
        startDate:
          projectData.startDate || new Date().toISOString().split('T')[0],
        endDate: projectData.endDate || new Date().toISOString().split('T')[0],
        proposalDeadline: projectData.proposalDeadline,
        budget: projectData.budget || 0,
        estimatedValue: projectData.estimatedValue || 0,
        manager: projectData.manager || '',
        tags: projectData.tags || [],
        notes: projectData.notes || '',
      };

      let newProject: Project;

      try {
        // Tentar salvar no backend
        newProject = await projectService.createProject(newProjectData);
      } catch (backendError) {
        console.log('Backend not available, saving locally');
        // Fallback para localStorage
        newProject = {
          id: `proj-${Date.now()}`,
          ...newProjectData,
          actualCost: 0,
          progress: 0,
          team: [],
          files: [],
          tasks: [],
          milestones: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      setProjects(prev => [...prev, newProject]);
      projectService.saveProjectsToLocalStorage([...projects, newProject]);
      setShowProjectForm(false);

      // Mostrar mensagem de sucesso
      alert('Project created successfully!');
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Error creating project. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (projectData: Partial<Project>) => {
    if (!selectedProject) return;

    try {
      setLoading(true);
      setError(null);

      const updatedProject = {
        ...selectedProject,
        ...projectData,
        updatedAt: new Date().toISOString(),
      };

      try {
        // Tentar atualizar no backend
        await projectService.updateProject(updatedProject);
      } catch (backendError) {
        console.log('Backend not available, updating locally');
      }

      setProjects(prev =>
        prev.map(p => (p.id === selectedProject.id ? updatedProject : p))
      );
      projectService.saveProjectsToLocalStorage(
        projects.map(p => (p.id === selectedProject.id ? updatedProject : p))
      );

      setSelectedProject(updatedProject);
      setShowProjectForm(false);

      // Mostrar mensagem de sucesso
      alert('Project updated successfully!');
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Error updating project. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this project? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      try {
        // Tentar excluir no backend
        await projectService.deleteProject(projectId);
      } catch (backendError) {
        console.log('Backend not available, deleting locally');
      }

      setProjects(prev => prev.filter(p => p.id !== projectId));
      projectService.saveProjectsToLocalStorage(
        projects.filter(p => p.id !== projectId)
      );

      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
        setShowProjectDetails(false);
      }

      // Mostrar mensagem de sucesso
      alert('Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Error deleting project. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  const managers = Array.from(new Set(projects.map(p => p.manager)));

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className='hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-red-500'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <CardTitle className='text-lg text-gray-900 mb-1'>
              {project.name}
            </CardTitle>
            <p className='text-sm text-gray-600 mb-2'>
              {project.client} • {project.location}
            </p>
            <div className='flex items-center space-x-2 mb-2'>
              <Badge className={getStatusColor(project.status)}>
                {getStatusLabel(project.status)}
              </Badge>
              <Badge className={getPriorityColor(project.priority)}>
                {getPriorityLabel(project.priority)}
              </Badge>
            </div>
          </div>
          <div className='flex items-center space-x-1'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handleViewProject(project)}
              title='View project'
            >
              <Eye className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSelectedProject(project);
                setShowProjectForm(true);
              }}
              title='Edit project'
            >
              <Edit className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handleDeleteProject(project.id)}
              className='text-red-600 hover:bg-red-50'
              title='Delete project'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className='space-y-3'>
          {/* Progress */}
          <div>
            <div className='flex justify-between text-sm mb-1'>
              <span>Progress</span>
              <span className='font-medium'>{project.progress}%</span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-red-600 h-2 rounded-full transition-all'
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Dates */}
          <div className='flex justify-between text-sm'>
            <div className='flex items-center'>
              <Calendar className='h-4 w-4 mr-1 text-gray-400' />
              <span>
                {formatDate(project.startDate)} - {formatDate(project.endDate)}
              </span>
            </div>
          </div>

          {/* Proposal Deadline */}
          {project.proposalDeadline && (
            <div className='flex items-center text-sm'>
              <Flag className='h-4 w-4 mr-1 text-orange-500' />
              <span>Proposal: {formatDate(project.proposalDeadline)}</span>
              {getDaysUntilDeadline(project.proposalDeadline) <= 7 && (
                <Badge className='ml-2 bg-orange-100 text-orange-800'>
                  {getDaysUntilDeadline(project.proposalDeadline)} days
                </Badge>
              )}
            </div>
          )}

          {/* Budget */}
          <div className='flex justify-between text-sm'>
            <div className='flex items-center'>
              <DollarSign className='h-4 w-4 mr-1 text-gray-400' />
              <span>Budget: {formatCurrency(project.budget)}</span>
            </div>
            <span className='text-green-600 font-medium'>
              {formatCurrency(project.estimatedValue)}
            </span>
          </div>

          {/* Team */}
          <div className='flex items-center text-sm'>
            <Users className='h-4 w-4 mr-1 text-gray-400' />
            <span>{project.team?.length || 0} member(s)</span>
            <span className='ml-2 text-gray-600'>• {project.manager}</span>
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {project.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant='secondary' className='text-xs'>
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 3 && (
                <Badge variant='secondary' className='text-xs'>
                  +{project.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Modal de detalhes do projeto
  const ProjectDetailsModal = () => {
    if (!selectedProject) return null;

    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
        <div className='bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
          <div className='p-6'>
            <div className='flex justify-between items-start mb-6'>
              <div>
                <h2 className='text-2xl font-bold text-gray-900'>
                  {selectedProject.name}
                </h2>
                <p className='text-gray-600'>
                  {selectedProject.client} • {selectedProject.location}
                </p>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowProjectDetails(false)}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h3 className='text-lg font-semibold mb-3'>
                  Basic Information
                </h3>
                <div className='space-y-2'>
                  <div>
                    <span className='font-medium'>Status:</span>
                    <Badge
                      className={`ml-2 ${getStatusColor(selectedProject.status)}`}
                    >
                      {getStatusLabel(selectedProject.status)}
                    </Badge>
                  </div>
                  <div>
                    <span className='font-medium'>Priority:</span>
                    <Badge
                      className={`ml-2 ${getPriorityColor(
                        selectedProject.priority
                      )}`}
                    >
                      {getPriorityLabel(selectedProject.priority)}
                    </Badge>
                  </div>
                  <div>
                    <span className='font-medium'>Manager:</span>{' '}
                    {selectedProject.manager}
                  </div>
                  <div>
                    <span className='font-medium'>Progress:</span>{' '}
                    {selectedProject.progress}%
                  </div>
                </div>
              </div>

              <div>
                <h3 className='text-lg font-semibold mb-3'>Dates</h3>
                <div className='space-y-2'>
                  <div>
                    <span className='font-medium'>Start:</span>{' '}
                    {formatDate(selectedProject.startDate)}
                  </div>
                  <div>
                    <span className='font-medium'>End:</span>{' '}
                    {formatDate(selectedProject.endDate)}
                  </div>
                  {selectedProject.proposalDeadline && (
                    <div>
                      <span className='font-medium'>Proposal:</span>{' '}
                      {formatDate(selectedProject.proposalDeadline)}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className='text-lg font-semibold mb-3'>Financial</h3>
                <div className='space-y-2'>
                  <div>
                    <span className='font-medium'>Budget:</span>{' '}
                    {formatCurrency(selectedProject.budget)}
                  </div>
                  <div>
                    <span className='font-medium'>Estimated Value:</span>{' '}
                    {formatCurrency(selectedProject.estimatedValue)}
                  </div>
                  <div>
                    <span className='font-medium'>Actual Cost:</span>{' '}
                    {formatCurrency(selectedProject.actualCost)}
                  </div>
                </div>
              </div>

              <div>
                <h3 className='text-lg font-semibold mb-3'>Team</h3>
                <div className='space-y-2'>
                  <div>
                    <span className='font-medium'>Members:</span>{' '}
                    {selectedProject.team?.length || 0}
                  </div>
                  {selectedProject.team && selectedProject.team.length > 0 && (
                    <div className='text-sm text-gray-600'>
                      {selectedProject.team
                        .map(member => member.name)
                        .join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedProject.description && (
              <div className='mt-6'>
                <h3 className='text-lg font-semibold mb-3'>Description</h3>
                <p className='text-gray-700'>{selectedProject.description}</p>
              </div>
            )}

            {selectedProject.notes && (
              <div className='mt-6'>
                <h3 className='text-lg font-semibold mb-3'>Notes</h3>
                <p className='text-gray-700'>{selectedProject.notes}</p>
              </div>
            )}

            {selectedProject.tags && selectedProject.tags.length > 0 && (
              <div className='mt-6'>
                <h3 className='text-lg font-semibold mb-3'>Tags</h3>
                <div className='flex flex-wrap gap-2'>
                  {selectedProject.tags.map(tag => (
                    <Badge key={tag} variant='secondary'>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className='mt-6 flex space-x-3'>
              <Button
                onClick={() => {
                  setShowProjectDetails(false);
                  setShowProjectForm(true);
                }}
                className='bg-red-600 hover:bg-red-700 text-white'
              >
                <Edit className='h-4 w-4 mr-2' />
                Edit Project
              </Button>
              <Button
                variant='outline'
                onClick={() => setShowProjectDetails(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Status de Conectividade */}
      <div
        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
          connectivity.isConnected
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            connectivity.isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span>{connectivity.connectionStatusText}</span>

        {syncStatus !== 'idle' && (
          <div className='flex items-center gap-1 ml-2'>
            {syncStatus === 'syncing' && (
              <div className='w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin' />
            )}
            <span
              className={`text-xs ${
                syncStatus === 'success'
                  ? 'text-green-600'
                  : syncStatus === 'error'
                    ? 'text-red-600'
                    : 'text-blue-600'
              }`}
            >
              {syncStatus === 'syncing' && 'Sincronizando...'}
              {syncStatus === 'success' && 'Sincronizado!'}
              {syncStatus === 'error' && 'Erro na sincronização'}
            </span>
          </div>
        )}

        {!connectivity.isConnected && (
          <button
            onClick={() => connectivity.forceCheck()}
            className='ml-auto px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700'
            disabled={connectivity.isRetrying}
          >
            {connectivity.isRetrying ? 'Tentando...' : 'Reconectar'}
          </button>
        )}
      </div>

      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Project Management
          </h1>
          <p className='text-gray-600'>
            {filteredProjects.length} of {projects.length} project(s)
          </p>
        </div>
        <div className='flex flex-col sm:flex-row gap-2'>
          <Button
            variant='outline'
            onClick={() => setShowTeamManager(true)}
            className='h-10 px-4 py-2 text-sm font-medium'
          >
            <Users className='h-4 w-4 mr-2' />
            Teams
          </Button>
          <Button
            onClick={() => setShowProjectForm(true)}
            className='bg-red-600 hover:bg-red-700 text-white h-10 px-4 py-2 text-sm font-medium'
          >
            <Plus className='h-4 w-4 mr-2' />
            New Project
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='p-4'>
            <div className='flex items-center text-red-800'>
              <AlertTriangle className='h-5 w-5 mr-2' />
              <span>{error}</span>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setError(null)}
                className='ml-auto text-red-800 hover:bg-red-100'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                <Input
                  placeholder='Search projects, clients, location or tags...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            <div className='flex gap-2 flex-wrap'>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-md text-sm'
              >
                <option value='all'>All Status</option>
                <option value='planning'>Planning</option>
                <option value='in-progress'>In Progress</option>
                <option value='review'>In Review</option>
                <option value='completed'>Completed</option>
                <option value='cancelled'>Cancelled</option>
                <option value='on-hold'>On Hold</option>
              </select>

              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-md text-sm'
              >
                <option value='all'>All Priorities</option>
                <option value='low'>Low</option>
                <option value='medium'>Medium</option>
                <option value='high'>High</option>
                <option value='urgent'>Urgent</option>
              </select>

              <select
                value={managerFilter}
                onChange={e => setManagerFilter(e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-md text-sm'
              >
                <option value='all'>All Managers</option>
                {managers.map(manager => (
                  <option key={manager} value={manager}>
                    {manager}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className='px-3 py-2 border border-gray-300 rounded-md text-sm'
              >
                <option value='startDate'>Start Date</option>
                <option value='endDate'>End Date</option>
                <option value='name'>Name</option>
                <option value='progress'>Progress</option>
                <option value='budget'>Budget</option>
              </select>

              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredProjects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className='p-8 text-center'>
            <Building className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No projects found
            </h3>
            <p className='text-gray-600 mb-4'>
              {projects.length === 0
                ? 'Create your first project to get started.'
                : 'Adjust the filters to find projects.'}
            </p>
            <Button
              onClick={() => setShowProjectForm(true)}
              className='bg-red-600 hover:bg-red-700 text-white'
            >
              <Plus className='h-4 w-4 mr-2' />
              {projects.length === 0
                ? 'Create First Project'
                : 'Create New Project'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Project Form Modal */}
      {showProjectForm && (
        <ProjectForm
          project={selectedProject}
          onSave={selectedProject ? handleUpdateProject : handleCreateProject}
          onCancel={() => {
            setShowProjectForm(false);
            setSelectedProject(null);
          }}
        />
      )}

      {/* Project Details Modal */}
      {showProjectDetails && <ProjectDetailsModal />}

      {/* Team Manager Modal */}
      {showTeamManager && (
        <TeamManager
          projects={projects}
          onClose={() => setShowTeamManager(false)}
          onProjectUpdate={(projectId, teamData) => {
            setProjects(prev =>
              prev.map(p =>
                p.id === projectId
                  ? { ...p, ...teamData, updatedAt: new Date().toISOString() }
                  : p
              )
            );
            projectService.saveProjectsToLocalStorage(
              projects.map(p =>
                p.id === projectId
                  ? { ...p, ...teamData, updatedAt: new Date().toISOString() }
                  : p
              )
            );
          }}
        />
      )}
    </div>
  );
}
