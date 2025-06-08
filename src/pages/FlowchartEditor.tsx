
import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '../components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start' },
    position: { x: 250, y: 25 },
  },
  {
    id: '2',
    data: { label: 'Process' },
    position: { x: 100, y: 125 },
  },
  {
    id: '3',
    type: 'output',
    data: { label: 'End' },
    position: { x: 250, y: 250 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

export function FlowchartEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isLoading, setIsLoading] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Load flowchart data from Supabase
  const loadFlowchart = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_flowcharts')
        .select('flowchart_data')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading flowchart:', error);
        return;
      }

      if (data?.flowchart_data) {
        const flowchartData = data.flowchart_data as any;
        if (flowchartData.nodes) setNodes(flowchartData.nodes);
        if (flowchartData.edges) setEdges(flowchartData.edges);
      }
    } catch (error) {
      console.error('Error loading flowchart:', error);
    }
  };

  // Save flowchart data to Supabase
  const saveFlowchart = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const flowchartData = { nodes, edges };
      
      const { error } = await supabase
        .from('user_flowcharts')
        .upsert({
          user_id: user.id,
          flowchart_data: flowchartData,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to save flowchart: " + error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Flowchart saved successfully!",
        });
      }
    } catch (error) {
      console.error('Error saving flowchart:', error);
      toast({
        title: "Error",
        description: "Failed to save flowchart",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  useEffect(() => {
    if (user) {
      loadFlowchart();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Flowchart Editor</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.email}</span>
          <Button onClick={saveFlowchart} disabled={isLoading} size="sm">
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
          <Button onClick={() => navigate('/admin')} variant="outline" size="sm">
            Admin Panel
          </Button>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            Sign Out
          </Button>
        </div>
      </div>

      {/* Flowchart Editor */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          attributionPosition="bottom-right"
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}
