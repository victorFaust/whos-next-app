"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, RotateCcw, Users, CheckCircle, Trash2, UserX, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Stats {
  total: number;
  picked: number;
  remaining: number;
  excluded: number;
}

interface RoleStats {
  [role: string]: number;
}

interface Participant {
  id: number;
  email: string;
  name: string;
  role: string;
  picked: boolean;
  excluded: boolean;
}

interface TeamSelection {
  teamName: string;
  focusArea: string;
  participants: { id: number; email: string; name: string; role?: string }[];
  timestamp: string;
}

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [stats, setStats] = useState<Stats>({ total: 0, picked: 0, remaining: 0, excluded: 0 });
  const [roleStats, setRoleStats] = useState<RoleStats>({});
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teamHistory, setTeamHistory] = useState<TeamSelection[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an Excel file to upload.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Upload successful!",
          description: result.message,
        });
        setFile(null);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        fetchStats();
        fetchRoleStats();
        fetchParticipants();
        fetchTeamHistory();
      } else {
        toast({
          title: "Upload failed",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading the file.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Reset successful!",
          description: result.message,
        });
        setStats({ total: 0, picked: 0, remaining: 0, excluded: 0 });
        setRoleStats({});
        setParticipants([]);
        setTeamHistory([]);
      } else {
        toast({
          title: "Reset failed",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Reset failed",
        description: "An error occurred while resetting the list.",
        variant: "destructive"
      });
    } finally {
      setResetting(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/names');
      const result = await response.json();
      if (response.ok) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchRoleStats = async () => {
    try {
      const response = await fetch('/api/roleStats');
      const result = await response.json();
      if (response.ok) {
        setRoleStats(result.roleStats);
      }
    } catch (error) {
      console.error('Failed to fetch role stats:', error);
    }
  };

  const handleToggleExclusion = async (id: number, isExcluded: boolean) => {
    const action = isExcluded ? 'include' : 'exclude';
    if (!confirm(`Are you sure you want to ${action} this participant from future draws?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/participants?id=${id}&action=toggleExclusion`, {
        method: 'PATCH',
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: `Participant ${action}d!`,
          description: result.message,
        });
        fetchStats();
        fetchRoleStats();
        fetchParticipants();
      } else {
        toast({
          title: "Update failed",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "An error occurred while updating the participant.",
        variant: "destructive"
      });
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await fetch('/api/participants');
      const result = await response.json();
      if (response.ok) {
        setParticipants(result.participants);
      }
    } catch (error) {
      console.error('Failed to fetch participants:', error);
    }
  };

  const handleDeleteParticipant = async (id: number) => {
    if (!confirm('Are you sure you want to delete this participant?')) {
      return;
    }

    try {
      const response = await fetch(`/api/participants?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Participant deleted!",
          description: result.message,
        });
        fetchStats();
        fetchRoleStats();
        fetchParticipants();
      } else {
        toast({
          title: "Delete failed",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the participant.",
        variant: "destructive"
      });
    }
  };

  const fetchTeamHistory = async () => {
    try {
      const response = await fetch('/api/teamHistory');
      const result = await response.json();
      if (response.ok) {
        setTeamHistory(result.history);
      }
    } catch (error) {
      console.error('Failed to fetch team history:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRoleStats();
    fetchParticipants();
    fetchTeamHistory();
  }, []);

  const getRoleColor = (role: string | undefined) => {
    if (!role) return 'text-gray-600';
    
    const colors: Record<string, string> = {
      'DEV': 'text-blue-600',
      'PM': 'text-purple-600',
      'QA': 'text-green-600',
      'BA': 'text-orange-600',
      'DESIGN': 'text-pink-600',
      'LEAD': 'text-red-600'
    };
    return colors[role.toUpperCase()] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage participants for "Who's Next?"</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-[#cc0000]" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600">Total Participants</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.picked}</p>
                  <p className="text-sm text-gray-600">Already Picked</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.remaining}</p>
                  <p className="text-sm text-gray-600">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <UserX className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.excluded}</p>
                  <p className="text-sm text-gray-600">Excluded</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Distribution */}
        {Object.keys(roleStats).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Role Distribution</CardTitle>
              <CardDescription>Number of participants by role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(roleStats).map(([role, count]) => (
                  <div key={role} className="text-center">
                    <p className={`text-2xl font-bold ${getRoleColor(role)}`}>{count}</p>
                    <p className="text-sm text-gray-600">{role}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload Participant List</span>
            </CardTitle>
            <CardDescription>
              Upload an Excel file with participant emails and roles. The file should have columns titled "Email" and "Role".
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Excel File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>

            {file && (
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-[#cc0000]">
                  Selected: <span className="font-medium">{file.name}</span>
                </p>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full bg-[#cc0000] hover:bg-[#990000] text-white"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Participants
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Reset Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <RotateCcw className="h-5 w-5" />
              <span>Reset List</span>
            </CardTitle>
            <CardDescription>
              Clear all participants and selections. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleReset}
              disabled={resetting}
              variant="destructive"
              className="w-full bg-[#cc0000] hover:bg-[#990000] text-white"
            >
              {resetting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Hard Reset
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Participants Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Participants</CardTitle>
            <CardDescription>View and manage uploaded participants</CardDescription>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <p className="text-gray-600">No participants uploaded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 text-gray-900 font-semibold">Name</th>
                      <th className="py-2 px-4 text-gray-900 font-semibold">Email</th>
                      <th className="py-2 px-4 text-gray-900 font-semibold">Role</th>
                      <th className="py-2 px-4 text-gray-900 font-semibold">Status</th>
                      <th className="py-2 px-4 text-gray-900 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant) => (
                      <tr key={participant.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{participant.name}</td>
                        <td className="py-2 px-4 text-sm text-gray-600">{participant.email}</td>
                        <td className="py-2 px-4">
                          <span className={`text-xs px-2 py-1 rounded ${getRoleColor(participant.role)} bg-gray-100`}>
                            {participant.role}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <span className={`text-xs px-2 py-1 rounded ${
                            participant.excluded
                              ? 'text-red-700 bg-red-100'
                              : participant.picked 
                                ? 'text-green-700 bg-green-100' 
                                : 'text-orange-700 bg-orange-100'
                          }`}>
                            {participant.excluded ? 'Excluded' : participant.picked ? 'Selected' : 'Available'}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant={participant.excluded ? "default" : "secondary"}
                              size="sm"
                              onClick={() => handleToggleExclusion(participant.id, participant.excluded)}
                              className={`h-8 w-8 p-0 ${
                                participant.excluded 
                                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                                  : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                              }`}
                              title={participant.excluded ? 'Include in draws' : 'Exclude from draws'}
                            >
                              {participant.excluded ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteParticipant(participant.id)}
                              className="h-8 w-8 p-0"
                              title="Delete participant"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Selected Teams</CardTitle>
            <CardDescription>History of selected teams and their members</CardDescription>
          </CardHeader>
          <CardContent>
            {teamHistory.length === 0 ? (
              <p className="text-gray-600">No teams selected yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 text-gray-900 font-semibold">Team Name</th>
                      <th className="py-2 px-4 text-gray-900 font-semibold">Focus Area</th>
                      <th className="py-2 px-4 text-gray-900 font-semibold">Participants</th>
                      <th className="py-2 px-4 text-gray-900 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamHistory.map((team, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{team.teamName}</td>
                        <td className="py-2 px-4">{team.focusArea}</td>
                        <td className="py-2 px-4">
                          <div className="space-y-1">
                            {team.participants.map((p, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <span>{p.name}</span>
                                {p.role && (
                                  <span className={`text-xs px-2 py-1 rounded ${getRoleColor(p.role)} bg-gray-100`}>
                                    {p.role}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          {new Date(team.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="text-center">
          <Button asChild variant="outline" className="text-[#cc0000] border-[#cc0000] hover:bg-[#ffe6e6]">
            <a href="/play">Go to Game →</a>
          </Button>
        </div>
      </div>

      {/* Powered By Footer */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
      <p className="text-sm text-gray-500">Powered by <strong className="text-[#cc0000]">CIO KSS Team</strong></p>
      </div>
    </div>
  );
}