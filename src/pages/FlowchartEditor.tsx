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

const defaultFlowchart = {
  nodes: [
    {
      id: 'node_1',
      data: { label: 'Do you have an EMSN (Electronic Message Sequence Number)?' },
      position: { x: 250, y: 25 },
    },
    {
      id: 'node_2',
      data: { label: 'Do you have Business Events?' },
      position: { x: 100, y: 125 },
    },
    {
      id: 'node_3',
      data: { label: 'ASK FOR TRADE DETAILS - What do you need to do? (Select all that apply)' },
      position: { x: 400, y: 125 },
    },
    {
      id: 'node_4',
      data: { label: 'Identify the error message in the business events. Go to Trade Investigation Part 2: Scenario Analysis' },
      position: { x: 100, y: 250 },
    },
    {
      id: 'node_5',
      data: { label: 'What type of checks do you need to perform? (Select all that apply)' },
      position: { x: 400, y: 250 },
    },
    {
      id: 'node_6',
      data: { label: 'Find the EMSN and proceed with trade investigation. Use the EMSN to track the specific transaction through the system.' },
      position: { x: 250, y: 375 },
    },
    {
      id: 'node_7',
      data: { label: 'Escalate to TCAS (Trade Capture and Settlement) team. Provide all available trade details and context for further investigation.' },
      position: { x: 100, y: 375 },
    },
    {
      id: 'node_8',
      data: { label: 'Check Limits (BCT/RiskPortfolio) completed. Review limit settings and verify if any limits have been breached. Contact Risk Management team if limits are exceeded.' },
      position: { x: 400, y: 375 },
    },
    {
      id: 'node_9',
      data: { label: 'Check ADS (Rule to No Pricing/Currency Blacklisted) completed. Review ADS rules configuration and verify if pricing or currency restrictions apply. Contact Compliance team if blacklisted items are found.' },
      position: { x: 600, y: 250 },
    },
    {
      id: 'node_10',
      data: { label: 'Check MTF Enablement completed. Verify MTF (Multilateral Trading Facility) configuration settings. Contact Technology team if MTF enablement issues are detected.' },
      position: { x: 600, y: 375 },
    },
    {
      id: 'node_11',
      data: { label: 'Flow configurations review completed. Even with EMSN informed, if provider is not part of the business events or trade, these configurations have been reviewed (Limits, ADS Blacklist and MTF).' },
      position: { x: 800, y: 250 },
    },
    {
      id: 'node_12',
      data: { label: 'Additional trade information requested. Gather Trade ID, Counterparty details, Settlement Date, Currency information, and any relevant documentation before proceeding.' },
      position: { x: 800, y: 375 },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'node_1', target: 'node_2' },
    { id: 'e1-3', source: 'node_1', target: 'node_3' },
    { id: 'e2-4', source: 'node_2', target: 'node_4' },
    { id: 'e2-5', source: 'node_2', target: 'node_5' },
    { id: 'e3-6', source: 'node_3', target: 'node_6' },
    { id: 'e3-7', source: 'node_3', target: 'node_7' },
    { id: 'e3-12', source: 'node_3', target: 'node_12' },
    { id: 'e5-8', source: 'node_5', target: 'node_8' },
    { id: 'e5-9', source: 'node_5', target: 'node_9' },
    { id: 'e5-10', source: 'node_5', target: 'node_10' },
    { id: 'e5-11', source: 'node_5', target: 'node_11' },
  ],
};

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
      } else {
        // No flowchart found, seed with default
        setNodes(defaultFlowchart.nodes);
        setEdges(defaultFlowchart.edges);
        await supabase.from('user_flowcharts').upsert({
          user_id: user.id,
          flowchart_data: defaultFlowchart,
        });
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
