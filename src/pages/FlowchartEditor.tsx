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

const defaultFlowchart = {
  startNodeId: "node_1",
  nodes: {
    "node_1": {
      id: "node_1",
      question: "Do you have Business Events to process?",
      selectionMode: "single",
      options: {
        option1: { text: "Yes", nextNodeId: "node_2" },
        option2: { text: "No", nextNodeId: "node_3" }
      },
      isEndpoint: false,
      endpointMessage: null
    },
    "node_2": {
      id: "node_2",
      question: "What checks do you need to perform? (Select all that apply)",
      selectionMode: "multiple",
      options: {
        option1: { text: "Check BCT/RiskPortfolio Limits", nextNodeId: "node_8" },
        option2: { text: "Check ADS Rules", nextNodeId: "node_9" },
        option3: { text: "Verify Settlement Instructions", nextNodeId: "node_10" },
        option4: { text: "Review Counterparty Limits", nextNodeId: "node_11" }
      },
      isEndpoint: false,
      endpointMessage: null
    },
    "node_3": {
      id: "node_3",
      question: "Do you have an EMSN (Electronic Message Sequence Number)?",
      selectionMode: "single",
      options: {
        option1: { text: "Yes", nextNodeId: "node_6" },
        option2: { text: "No", nextNodeId: "node_7" }
      },
      isEndpoint: false,
      endpointMessage: null
    },
    "node_4": {
      id: "node_4",
      question: "",
      selectionMode: "single",
      options: { option1: { text: "", nextNodeId: null }, option2: { text: "", nextNodeId: null } },
      isEndpoint: true,
      endpointMessage: "Multiple investigation paths completed. Review all selected areas for comprehensive trade analysis."
    },
    "node_5": {
      id: "node_5",
      question: "Which system check do you need to perform?",
      selectionMode: "single",
      options: {
        option1: { text: "Check BCT/RiskPortfolio Limits", nextNodeId: "node_8" },
        option2: { text: "Check ADS Rules", nextNodeId: "node_9" }
      },
      isEndpoint: false,
      endpointMessage: null
    },
    "node_6": {
      id: "node_6",
      question: "",
      selectionMode: "single",
      options: { option1: { text: "", nextNodeId: null }, option2: { text: "", nextNodeId: null } },
      isEndpoint: true,
      endpointMessage: "Find the EMSN and proceed with trade investigation. Use the EMSN to track the specific transaction through the system."
    },
    "node_7": {
      id: "node_7",
      question: "What type of trade details do you need?",
      selectionMode: "single",
      options: {
        option1: { text: "Ask for Trade Details", nextNodeId: "node_10" },
        option2: { text: "Escalate to TCAS", nextNodeId: "node_11" }
      },
      isEndpoint: false,
      endpointMessage: null
    },
    "node_8": {
      id: "node_8",
      question: "What is the BCT/RiskPortfolio limit status?",
      selectionMode: "single",
      options: {
        option1: { text: "Limits are breached", nextNodeId: "node_12" },
        option2: { text: "Limits are within range", nextNodeId: "node_13" }
      },
      isEndpoint: false,
      endpointMessage: null
    },
    "node_9": {
      id: "node_9",
      question: "What ADS rule issues do you observe? (Select all that apply)",
      selectionMode: "multiple",
      options: {
        option1: { text: "Pricing/Currency Blacklisted", nextNodeId: "node_14" },
        option2: { text: "MTF Enablement Issue", nextNodeId: "node_15" },
        option3: { text: "Settlement Date Conflict", nextNodeId: "node_16" }
      },
      isEndpoint: false,
      endpointMessage: null
    },
    "node_10": {
      id: "node_10",
      question: "Do you have sufficient trade information?",
      selectionMode: "single",
      options: {
        option1: { text: "Yes, proceed with investigation", nextNodeId: "node_16" },
        option2: { text: "No, need more details", nextNodeId: "node_17" }
      },
      isEndpoint: false,
      endpointMessage: null
    },
    "node_11": {
      id: "node_11",
      question: "",
      selectionMode: "single",
      options: { option1: { text: "", nextNodeId: null }, option2: { text: "", nextNodeId: null } },
      isEndpoint: true,
      endpointMessage: "Escalate to TCAS (Trade Capture and Settlement) team. Provide all available trade details and context for further investigation."
    },
    "node_12": {
      id: "node_12",
      question: "",
      selectionMode: "single",
      options: { option1: { text: "", nextNodeId: null }, option2: { text: "", nextNodeId: null } },
      isEndpoint: true,
      endpointMessage: "BCT/RiskPortfolio limits have been breached. Contact Risk Management team to review limit settings and authorize trade if appropriate."
    },
    "node_13": {
      id: "node_13",
      question: "Are there any other risk factors to consider?",
      selectionMode: "single",
      options: {
        option1: { text: "Yes, additional checks needed", nextNodeId: "node_18" },
        option2: { text: "No, proceed with trade", nextNodeId: "node_19" }
      },
      isEndpoint: false,
      endpointMessage: null
    },
    "node_14": {
      id: "node_14",
      question: "",
      selectionMode: "single",
      options: { option1: { text: "", nextNodeId: null }, option2: { text: "", nextNodeId: null } },
      isEndpoint: true,
      endpointMessage: "Pricing/Currency is blacklisted in ADS rules. Review the blacklist settings and contact Compliance team to verify if the restriction should be lifted."
    },
    "node_15": {
      id: "node_15",
      question: "",
      selectionMode: "single",
      options: { option1: { text: "", nextNodeId: null }, option2: { text: "", nextNodeId: null } },
      isEndpoint: true,
      endpointMessage: "MTF (Multilateral Trading Facility) enablement issue detected. Check MTF configuration settings and contact Technology team for system updates."
    },
    "node_16": {
      id: "node_16",
      question: "What type of investigation is required?",
      selectionMode: "single",
      options: {
        option1: { text: "Standard trade validation", nextNodeId: "node_20" },
        option2: { text: "Complex scenario analysis", nextNodeId: "node_21" }
      },
      isEndpoint: false,
      endpointMessage: null
    },
    "node_17": {
      id: "node_17",
      question: "",
      selectionMode: "single",
      options: { option1: { text: "", nextNodeId: null }, option2: { text: "", nextNodeId: null } },
      isEndpoint: true,
      endpointMessage: "Insufficient trade details provided. Request additional information including: Trade ID, Counterparty, Settlement Date, and Currency details before proceeding."
    },
    "node_18": {
      id: "node_18",
      question: "",
      selectionMode: "single",
      options: { option1: { text: "", nextNodeId: null }, option2: { text: "", nextNodeId: null } },
      isEndpoint: true,
      endpointMessage: "Additional risk checks required. Perform enhanced due diligence including credit risk assessment, market risk analysis, and regulatory compliance verification."
    },
    "node_19": {
      id: "node_19",
      question: "",
      selectionMode: "single",
      options: { option1: { text: "", nextNodeId: null }, option2: { text: "", nextNodeId: null } },
      isEndpoint: true,
      endpointMessage: "All risk checks passed successfully. Trade can proceed through normal settlement process. Monitor for any post-trade issues."
    },
    "node_20": {
      id: "node_20",
      question: "",
      selectionMode: "single",
      options: { option1: { text: "", nextNodeId: null }, option2: { text: "", nextNodeId: null } },
      isEndpoint: true,
      endpointMessage: "Perform standard trade validation: Verify trade details, check counterparty limits, validate pricing, and confirm settlement instructions are correct."
    },
    "node_21": {
      id: "node_21",
      question: "",
      selectionMode: "single",
      options: { option1: { text: "", nextNodeId: null }, option2: { text: "", nextNodeId: null } },
      isEndpoint: true,
      endpointMessage: "Complex scenario analysis required. Go to Trade Investigation Part 2: Scenario Analysis. Document all findings and escalate to senior trading desk if needed."
    }
  }
};

export function FlowchartEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
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
