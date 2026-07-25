import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '../api/workspaceApi';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [mode, setModeState] = useState(() => {
    return localStorage.getItem('myplanner_app_mode') || 'personal';
  });

  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState(() => {
    return localStorage.getItem('myplanner_current_workspace_id') || null;
  });

  const setMode = (newMode) => {
    setModeState(newMode);
    localStorage.setItem('myplanner_app_mode', newMode);
  };

  const setCurrentWorkspaceId = (id) => {
    setCurrentWorkspaceIdState(id);
    if (id) {
      localStorage.setItem('myplanner_current_workspace_id', id);
    } else {
      localStorage.removeItem('myplanner_current_workspace_id');
    }
  };

  // Fetch workspaces query
  const { data: workspacesData, isLoading: isWorkspacesLoading, refetch: refetchWorkspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: workspaceApi.getWorkspaces,
    enabled: isAuthenticated
  });

  const workspaces = workspacesData?.workspaces || [];

  // Determine current active workspace
  const currentWorkspace =
    workspaces.find((w) => w._id === currentWorkspaceId) ||
    workspaces[0] ||
    null;

  useEffect(() => {
    if (workspaces.length > 0 && (!currentWorkspaceId || !workspaces.some((w) => w._id === currentWorkspaceId))) {
      setCurrentWorkspaceId(workspaces[0]._id);
    }
  }, [workspaces, currentWorkspaceId]);

  // Create Workspace mutation
  const createWorkspaceMutation = useMutation({
    mutationFn: workspaceApi.createWorkspace,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      if (data.workspace?._id) {
        setCurrentWorkspaceId(data.workspace._id);
        setMode('workspace');
      }
    }
  });

  return (
    <WorkspaceContext.Provider
      value={{
        mode,
        setMode,
        workspaces,
        currentWorkspace,
        currentWorkspaceId: currentWorkspace?._id || null,
        setCurrentWorkspaceId,
        isWorkspacesLoading,
        refetchWorkspaces,
        createWorkspace: createWorkspaceMutation.mutateAsync,
        isCreatingWorkspace: createWorkspaceMutation.isPending
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
