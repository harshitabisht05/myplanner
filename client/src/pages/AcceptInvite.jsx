import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Building, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/axiosClient';

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { setMode, setCurrentWorkspaceId, refetchWorkspaces } = useWorkspace();

  const [loading, setLoading] = useState(true);
  const [inviteDetails, setInviteDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!token) {
      setErrorMsg('No invitation token provided.');
      setLoading(false);
      return;
    }

    const fetchInvite = async () => {
      try {
        const res = await api.get(`/workspaces/invites/${token}`);
        setInviteDetails(res.data.invite);
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Invalid or expired workspace invitation link');
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [token]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const res = await api.post(`/workspaces/invites/${token}/accept`);
      showSuccess(res.data.message || 'Joined workspace successfully! 🎉');
      await refetchWorkspaces();
      if (res.data.workspace?._id) {
        setCurrentWorkspaceId(res.data.workspace._id);
        setMode('workspace');
        navigate('/workspace');
      } else {
        navigate('/');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Verifying workspace invitation link..." fullPage />;
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-planner-bg">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-planner-text">Invalid Invitation</h2>
          <p className="text-xs text-planner-muted">{errorMsg}</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const workspace = inviteDetails?.workspace || {};
  const inviter = inviteDetails?.inviter || {};

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-planner-bg">
      <Card className="max-w-md w-full p-6 text-center space-y-5 shadow-cozy border-planner-border">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 mx-auto flex items-center justify-center text-2xl font-bold border border-purple-500/20">
          {workspace.icon || '🏢'}
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-planner-text">Join "{workspace.name || 'Workspace'}"</h2>
          <p className="text-xs text-planner-muted">
            <span className="font-bold text-planner-text">{inviter.name || 'A teammate'}</span> invited you as a{' '}
            <span className="font-bold text-planner-primary capitalize">{inviteDetails?.role || 'developer'}</span>.
          </p>
        </div>

        {workspace.description && (
          <p className="text-xs text-planner-muted bg-planner-secondary/50 p-3 rounded-xl border border-planner-border">
            {workspace.description}
          </p>
        )}

        <div className="pt-2 flex flex-col gap-2">
          <Button variant="primary" onClick={handleAccept} disabled={accepting} className="w-full">
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Accept Invitation & Join
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')} className="w-full text-xs text-planner-muted">
            Decline / Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AcceptInvite;
