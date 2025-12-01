import React, { useState, useEffect } from 'react';
import { Folder, FolderPlus, FolderOpen, MoreHorizontal, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';

interface Folder {
  id: string;
  name: string;
  parent_id?: string;
  project_id: string;
  created_at: string;
  updated_at: string;
  children?: Folder[];
  plant_count?: number;
}

interface FolderManagerProps {
  projectId: string;
  onFolderSelect: (folderId: string | null) => void;
  selectedFolderId: string | null;
  className?: string;
}

export function FolderManager({ projectId, onFolderSelect, selectedFolderId, className }: FolderManagerProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [newFolderData, setNewFolderData] = useState({
    name: '',
    parent_id: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFolders();
  }, [projectId]);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      // TODO: Implementar API call para buscar pastas
      // const response = await getFolders(projectId);
      // setFolders(response.data);
      
      // Por enquanto, deixar vazio até implementar a API
      setFolders([]);
    } catch (error) {
      console.error('Erro ao buscar pastas:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFolderExpansion = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = async () => {
    try {
      // TODO: Implementar API call para criar pasta
      // await createFolder({
      //   name: newFolderData.name,
      //   parent_id: newFolderData.parent_id || null,
      //   project_id: projectId
      // });
      
      // TODO: Implementar API call para criar pasta
      // await createFolder({
      //   name: newFolderData.name,
      //   parent_id: newFolderData.parent_id || null,
      //   project_id: projectId
      // });
      
      // Por enquanto, não fazer nada até implementar a API
      console.log('Criar pasta:', newFolderData);
      setNewFolderData({ name: '', parent_id: '' });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar pasta:', error);
    }
  };

  const handleEditFolder = async () => {
    if (!editingFolder) return;
    
    try {
      // TODO: Implementar API call para editar pasta
      // await updateFolder(editingFolder.id, { name: editingFolder.name });
      
      setFolders(prev => prev.map(f => 
        f.id === editingFolder.id ? { ...f, name: editingFolder.name } : f
      ));
      setEditingFolder(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Erro ao editar pasta:', error);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta pasta?')) return;
    
    try {
      // TODO: Implementar API call para deletar pasta
      // await deleteFolder(folderId);
      
      setFolders(prev => prev.filter(f => f.id !== folderId));
    } catch (error) {
      console.error('Erro ao deletar pasta:', error);
    }
  };

  const renderFolder = (folder: Folder, level: number = 0) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
            isSelected ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'
          }`}
          onClick={() => onFolderSelect(folder.id)}
        >
          <div className="flex items-center gap-2 flex-1">
            <div style={{ marginLeft: `${level * 20}px` }} />
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolderExpansion(folder.id);
                }}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            ) : (
              <div className="w-6" />
            )}
            
            {isExpanded ? <FolderOpen className="h-4 w-4 text-blue-600" /> : <Folder className="h-4 w-4 text-gray-600" />}
            <span className="truncate">{folder.name}</span>
            <Badge variant="secondary" className="ml-2">
              {folder.plant_count || 0}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setEditingFolder(folder);
                setIsEditDialogOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFolder(folder.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {folder.children!.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Pastas</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Nova Pasta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Pasta</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="folder-name">Nome da Pasta</Label>
                    <Input
                      id="folder-name"
                      value={newFolderData.name}
                      onChange={(e) => setNewFolderData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Digite o nome da pasta"
                    />
                  </div>
                  <div>
                    <Label htmlFor="parent-folder">Pasta Pai (opcional)</Label>
                    <select
                      id="parent-folder"
                      className="w-full p-2 border rounded-md"
                      value={newFolderData.parent_id}
                      onChange={(e) => setNewFolderData(prev => ({ ...prev, parent_id: e.target.value }))}
                    >
                      <option value="">Nenhuma (pasta raiz)</option>
                      {folders.map(folder => (
                        <option key={folder.id} value={folder.id}>{folder.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateFolder} disabled={!newFolderData.name.trim()}>
                      Criar Pasta
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-2">
            <Button
              variant="ghost"
              className={`w-full justify-start p-2 ${
                selectedFolderId === null ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'
              }`}
              onClick={() => onFolderSelect(null)}
            >
              <Folder className="h-4 w-4 mr-2" />
              Todas as Plantas
            </Button>
          </div>
          
          <div className="border-t">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Carregando pastas...</div>
            ) : folders.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Nenhuma pasta criada</div>
            ) : (
              folders.map(folder => renderFolder(folder))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pasta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-folder-name">Nome da Pasta</Label>
              <Input
                id="edit-folder-name"
                value={editingFolder?.name || ''}
                onChange={(e) => setEditingFolder(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="Digite o nome da pasta"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditFolder} disabled={!editingFolder?.name.trim()}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
