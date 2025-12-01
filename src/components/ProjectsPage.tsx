import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Unarchive,
  Eye,
  Calendar,
  DollarSign,
  Users,
  Tag,
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useProjects, useProjectStats, Project } from '../lib/api';
import { toast } from '../hooks/use-toast';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { projects, loading, error, deleteProject, archiveProject } =
    useProjects();
  const { stats } = useProjectStats();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [estimatorFilter, setEstimatorFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.proposalNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || project.status === statusFilter;
    const matchesPriority =
      !priorityFilter || project.priority === priorityFilter;
    const matchesEstimator =
      !estimatorFilter || project.estimator === estimatorFilter;
    const matchesArchived = showArchived
      ? project.isArchived
      : !project.isArchived;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesEstimator &&
      matchesArchived
    );
  });

  const handleDelete = async (projectId: number) => {
    try {
      await deleteProject(projectId);
      toast({
        title: 'Project deleted',
        description: 'The project has been successfully deleted.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project.',
        variant: 'destructive',
      });
    }
  };

  const handleArchive = async (projectId: number, isArchived: boolean) => {
    try {
      await archiveProject(projectId, isArchived);
      toast({
        title: `Project ${isArchived ? 'archived' : 'unarchived'}`,
        description: `The project has been ${isArchived ? 'archived' : 'unarchived'} successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isArchived ? 'archive' : 'unarchive'} project.`,
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'active':
        return <Clock className='h-4 w-4 text-blue-600' />;
      case 'planning':
        return <AlertCircle className='h-4 w-4 text-yellow-600' />;
      case 'onHold':
        return <Minus className='h-4 w-4 text-gray-600' />;
      default:
        return <Clock className='h-4 w-4 text-gray-600' />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <ArrowUp className='h-4 w-4 text-red-600' />;
      case 'medium':
        return <Minus className='h-4 w-4 text-yellow-600' />;
      case 'low':
        return <ArrowDown className='h-4 w-4 text-green-600' />;
      default:
        return <Minus className='h-4 w-4 text-gray-600' />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className='p-6'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-1/4 mb-6'></div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {[...Array(6)].map((_, i) => (
              <div key={i} className='h-48 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <div className='text-center'>
          <h2 className='text-xl font-semibold text-red-600'>
            Error loading projects
          </h2>
          <p className='text-gray-600 mt-2'>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Projects</h1>
          <p className='text-gray-600 mt-1'>
            Manage and track all your construction projects
          </p>
        </div>
        <div className='flex flex-col sm:flex-row gap-2'>
          <Button
            onClick={() => navigate('/team')}
            variant='outline'
            className='h-10 px-4 py-2 text-sm font-medium'
          >
            <Users className='h-4 w-4 mr-2' />
            Manage Teams
          </Button>
          <Button
            onClick={() => navigate('/new-project')}
            className='bg-red-600 hover:bg-red-700 h-10 px-4 py-2 text-sm font-medium'
          >
            <Plus className='h-4 w-4 mr-2' />
            New Project
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Projects
              </CardTitle>
              <Building2 className='h-4 w-4 text-gray-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.total}</div>
              <p className='text-xs text-gray-600'>
                {stats.active} active, {stats.archived} archived
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Budget
              </CardTitle>
              <DollarSign className='h-4 w-4 text-gray-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {formatCurrency(stats.totalBudget)}
              </div>
              <p className='text-xs text-gray-600'>
                Across all active projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Average Progress
              </CardTitle>
              <CheckCircle className='h-4 w-4 text-gray-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.averageProgress}%</div>
              <p className='text-xs text-gray-600'>Across active projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Active Projects
              </CardTitle>
              <Users className='h-4 w-4 text-gray-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.active}</div>
              <p className='text-xs text-gray-600'>
                {stats.byStatus.active} in progress, {stats.byStatus.planning}{' '}
                planning
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='h-5 w-5' />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Search</label>
              <Input
                placeholder='Search projects...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder='All statuses' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=''>All statuses</SelectItem>
                  <SelectItem value='planning'>Planning</SelectItem>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='completed'>Completed</SelectItem>
                  <SelectItem value='onHold'>On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder='All priorities' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=''>All priorities</SelectItem>
                  <SelectItem value='high'>High</SelectItem>
                  <SelectItem value='medium'>Medium</SelectItem>
                  <SelectItem value='low'>Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Estimator</label>
              <Select
                value={estimatorFilter}
                onValueChange={setEstimatorFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder='All estimators' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=''>All estimators</SelectItem>
                  <SelectItem value='CD'>Carlos Davis</SelectItem>
                  <SelectItem value='NR'>Nancy Rodriguez</SelectItem>
                  <SelectItem value='SC'>Sam Chen</SelectItem>
                  <SelectItem value='DT'>David Thompson</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Show Archived</label>
              <Button
                variant={showArchived ? 'default' : 'outline'}
                onClick={() => setShowArchived(!showArchived)}
                className='w-full h-10 px-4 py-2 text-sm font-medium'
              >
                {showArchived ? 'Hide Archived' : 'Show Archived'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredProjects.map(project => (
          <Card key={project.id} className='hover:shadow-lg transition-shadow'>
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between'>
                <div className='flex-1 min-w-0'>
                  <CardTitle className='text-lg truncate'>
                    {project.name}
                  </CardTitle>
                  <p className='text-sm text-gray-600 truncate'>
                    {project.clientName}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='sm'>
                      <MoreVertical className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <Eye className='h-4 w-4 mr-2' />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate(`/projects/${project.id}/edit`)}
                    >
                      <Edit className='h-4 w-4 mr-2' />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleArchive(project.id, !project.isArchived)
                      }
                    >
                      {project.isArchived ? (
                        <>
                          <Unarchive className='h-4 w-4 mr-2' />
                          Unarchive
                        </>
                      ) : (
                        <>
                          <Archive className='h-4 w-4 mr-2' />
                          Archive
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(project.id)}
                      className='text-red-600'
                    >
                      <Trash2 className='h-4 w-4 mr-2' />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600'>Status</span>
                  <div className='flex items-center gap-1'>
                    {getStatusIcon(project.status)}
                    <Badge variant='secondary' className='capitalize'>
                      {project.status}
                    </Badge>
                  </div>
                </div>

                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600'>Priority</span>
                  <div className='flex items-center gap-1'>
                    {getPriorityIcon(project.priority)}
                    <Badge
                      variant={
                        project.priority === 'high'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className='capitalize'
                    >
                      {project.priority}
                    </Badge>
                  </div>
                </div>

                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600'>Progress</span>
                  <span className='font-medium'>{project.progress}%</span>
                </div>

                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-red-600 h-2 rounded-full transition-all duration-300'
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className='space-y-2 text-sm'>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-gray-500' />
                  <span className='text-gray-600'>Start:</span>
                  <span>{formatDate(project.startDate)}</span>
                </div>

                <div className='flex items-center gap-2'>
                  <DollarSign className='h-4 w-4 text-gray-500' />
                  <span className='text-gray-600'>Budget:</span>
                  <span className='font-medium'>
                    {formatCurrency(project.budget)}
                  </span>
                </div>

                <div className='flex items-center gap-2'>
                  <Users className='h-4 w-4 text-gray-500' />
                  <span className='text-gray-600'>Team:</span>
                  <span>{project.teamMembers.length} members</span>
                </div>

                {project.tags.length > 0 && (
                  <div className='flex items-center gap-2'>
                    <Tag className='h-4 w-4 text-gray-500' />
                    <span className='text-gray-600'>Tags:</span>
                    <div className='flex gap-1'>
                      {project.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant='outline' className='text-xs'>
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 2 && (
                        <Badge variant='outline' className='text-xs'>
                          +{project.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {project.isArchived && (
                <Badge variant='secondary' className='w-full justify-center'>
                  Archived
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className='text-center py-12'>
          <Building2 className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No projects found
          </h3>
          <p className='text-gray-600 mb-4'>
            {searchTerm || statusFilter || priorityFilter || estimatorFilter
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by creating your first project.'}
          </p>
          {!searchTerm &&
            !statusFilter &&
            !priorityFilter &&
            !estimatorFilter && (
              <Button 
                onClick={() => navigate('/new-project')}
                className='h-10 px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700'
              >
                <Plus className='h-4 w-4 mr-2' />
                Create Project
              </Button>
            )}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
