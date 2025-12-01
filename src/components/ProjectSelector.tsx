import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, FolderOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { projectService } from '../services/projectService';

interface Project {
  id: string;
  name: string;
  description?: string;
  client?: string;
  status: string;
  created_at: string;
}

interface ProjectSelectorProps {
  selectedProjectId: string | null;
  onProjectSelect: (projectId: string) => void;
  className?: string;
}

export function ProjectSelector({
  selectedProjectId,
  onProjectSelect,
  className,
}: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar projetos do backend
      const fetchedProjects = await projectService.getProjects();
      setProjects(fetchedProjects);
    } catch (err) {
      setError('Error loading projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(
    project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProjectSelect = (projectId: string) => {
    onProjectSelect(projectId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'in-progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant='outline'
        onClick={() => setIsOpen(!isOpen)}
        className='w-full justify-between'
        disabled={loading}
      >
        <div className='flex items-center gap-2'>
          <FolderOpen className='h-4 w-4' />
          {selectedProject ? (
            <span className='truncate'>{selectedProject.name}</span>
          ) : (
            <span className='text-gray-500'>Projects</span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {isOpen && (
        <Card className='absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-hidden'>
          <CardContent className='p-0'>
            <div className='p-3 border-b'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Search projects...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            <div className='max-h-64 overflow-y-auto'>
              {loading ? (
                <div className='p-4 text-center text-gray-500'>
                  Loading projects...
                </div>
              ) : error ? (
                <div className='p-4 text-center text-red-500'>
                  {error}
                  <Button
                    variant='link'
                    onClick={fetchProjects}
                    className='p-0 h-auto text-sm'
                  >
                    Try again
                  </Button>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className='p-4 text-center text-gray-500'>
                  {searchTerm ? 'No projects found' : 'No projects available'}
                </div>
              ) : (
                filteredProjects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project.id)}
                    className='w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0 transition-colors'
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1 min-w-0'>
                        <div className='font-medium text-gray-900 truncate'>
                          {project.name}
                        </div>
                        {project.client && (
                          <div className='text-sm text-gray-500 truncate'>
                            Client: {project.client}
                          </div>
                        )}
                        {project.description && (
                          <div className='text-sm text-gray-600 truncate mt-1'>
                            {project.description}
                          </div>
                        )}
                      </div>
                      <Badge
                        className={`ml-2 flex-shrink-0 ${getStatusColor(project.status)}`}
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
