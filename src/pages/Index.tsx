import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, Edit, Trash2, Play, RotateCcw, Download, Eye, X } from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const FlowchartApp = () => {
  const defaultFlowchart = {
    startNodeId: "node_1",
    nodes: {
      "node_1": {
        id: "node_1",
        question: "Do you have an EMSN (Electronic Message Sequence Number)?",
        selectionMode: "single",
        options: {
          option1: { text: "YES", nextNodeId: "node_2" },
          option2: { text: "NO", nextNodeId: "node_3" }
        },
        isEndpoint: false,
        endpointMessage: null
      },
      "node_2": {
        id: "node_2",
        question: "Do you have Business Events?",
        selectionMode: "single",
        options: {
          option1: { text: "YES", nextNodeId: "node_4" },
          option2: { text: "YES but", nextNodeId: "node_5" }
        },
        isEndpoint: false,
        endpointMessage: null
      },
      "node_3": {
        id: "node_3",
        question: "ASK FOR TRADE DETAILS - What do you need to do? (Select all that apply)",
        selectionMode: "multiple",
        options: {
          option1: { text: "Find the EMSN and proceed", nextNodeId: "node_6" },
          option2: { text: "Escalate to TCAS", nextNodeId: "node_7" },
          option3: { text: "Request additional trade information", nextNodeId: "node_12" }
        },
        isEndpoint: false,
        endpointMessage: null
      },
      "node_4": {
        id: "node_4",
        question: "",
        selectionMode: "single",
        options: { option1: { text: "", nextNodeId: null } },
        isEndpoint: true,
        endpointMessage: "Identify the error message in the business events. Go to Trade Investigation Part 2: Scenario Analysis"
      },
      "node_5": {
        id: "node_5",
        question: "What type of checks do you need to perform? (Select all that apply)",
        selectionMode: "multiple",
        options: {
          option1: { text: "Check Limits (BCT/RiskPortfolio)", nextNodeId: "node_8" },
          option2: { text: "Check ADS (Rule to No Pricing/Currency Blacklisted)", nextNodeId: "node_9" },
          option3: { text: "Check MTF Enablement", nextNodeId: "node_10" },
          option4: { text: "Review flow configurations", nextNodeId: "node_11" }
        },
        isEndpoint: false,
        endpointMessage: null
      },
      "node_6": {
        id: "node_6",
        question: "",
        selectionMode: "single",
        options: { option1: { text: "", nextNodeId: null } },
        isEndpoint: true,
        endpointMessage: "Find the EMSN and proceed with trade investigation. Use the EMSN to track the specific transaction through the system."
      },
      "node_7": {
        id: "node_7",
        question: "",
        selectionMode: "single",
        options: { option1: { text: "", nextNodeId: null } },
        isEndpoint: true,
        endpointMessage: "Escalate to TCAS (Trade Capture and Settlement) team. Provide all available trade details and context for further investigation."
      },
      "node_8": {
        id: "node_8",
        question: "",
        selectionMode: "single",
        options: { option1: { text: "", nextNodeId: null } },
        isEndpoint: true,
        endpointMessage: "Check Limits (BCT/RiskPortfolio) completed. Review limit settings and verify if any limits have been breached. Contact Risk Management team if limits are exceeded."
      },
      "node_9": {
        id: "node_9",
        question: "",
        selectionMode: "single",
        options: { option1: { text: "", nextNodeId: null } },
        isEndpoint: true,
        endpointMessage: "Check ADS (Rule to No Pricing/Currency Blacklisted) completed. Review ADS rules configuration and verify if pricing or currency restrictions apply. Contact Compliance team if blacklisted items are found."
      },
      "node_10": {
        id: "node_10",
        question: "",
        selectionMode: "single",
        options: { option1: { text: "", nextNodeId: null } },
        isEndpoint: true,
        endpointMessage: "Check MTF Enablement completed. Verify MTF (Multilateral Trading Facility) configuration settings. Contact Technology team if MTF enablement issues are detected."
      },
      "node_11": {
        id: "node_11",
        question: "",
        selectionMode: "single",
        options: { option1: { text: "", nextNodeId: null } },
        isEndpoint: true,
        endpointMessage: "Flow configurations review completed. Even with EMSN informed, if provider is not part of the business events or trade, these configurations have been reviewed (Limits, ADS Blacklist and MTF)."
      },
      "node_12": {
        id: "node_12",
        question: "",
        selectionMode: "single",
        options: { option1: { text: "", nextNodeId: null } },
        isEndpoint: true,
        endpointMessage: "Additional trade information requested. Gather Trade ID, Counterparty details, Settlement Date, Currency information, and any relevant documentation before proceeding."
      }
    }
  };

  const { user } = useAuth();
  const [mode, setMode] = useState('admin');
  const [flowchart, setFlowchart] = useState(defaultFlowchart);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [userPath, setUserPath] = useState<Array<{
    nodeId: string;
    question: string;
    selectedTexts?: string[];
    selectedText?: string;
    selectedOptions?: string[];
    selectionMode?: string;
    timestamp?: string;
  }>>([]);
  const [editingNode, setEditingNode] = useState<any>(null);
  const [showAddNode, setShowAddNode] = useState(false);
  const [showPathView, setShowPathView] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [endpointMessages, setEndpointMessages] = useState<string[]>([]);

  // Load flowchart for user
  useEffect(() => {
    const loadFlowchart = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('user_flowcharts')
        .select('flowchart_data')
        .eq('user_id', user.id)
        .single();
      if (data && data.flowchart_data) {
        setFlowchart(data.flowchart_data);
      }
      setLoading(false);
    };
    loadFlowchart();
  }, [user]);

  // Save flowchart for user
  const saveFlowchart = async (newFlowchart: any) => {
    if (!user) return;
    await supabase
      .from('user_flowcharts')
      .upsert({
        user_id: user.id,
        flowchart_data: newFlowchart,
      });
    setFlowchart(newFlowchart);
  };

  const generateNodeId = () => {
    let counter = 1;
    while (flowchart.nodes[`node_${counter}`]) {
      counter++;
    }
    return `node_${counter}`;
  };

  const NodeForm = ({ node, onSave, onCancel }: { node?: any; onSave: any; onCancel: any }) => {
    const [options, setOptions] = useState(() => {
      if (node?.options) return node.options;
      return { option1: { text: '', nextNodeId: '' }, option2: { text: '', nextNodeId: '' } };
    });
    const [question, setQuestion] = useState(node?.question || '');
    const [isEndpoint, setIsEndpoint] = useState(node?.isEndpoint || false);
    const [endpointMessage, setEndpointMessage] = useState(node?.endpointMessage || '');
    const [selectionMode, setSelectionMode] = useState(node?.selectionMode || 'single');

    const availableNodes = Object.keys(flowchart.nodes).filter(id => id !== node?.id);
    const optionKeys = Object.keys(options);

    const addOption = () => {
      const newKey = `option${optionKeys.length + 1}`;
      setOptions({ ...options, [newKey]: { text: '', nextNodeId: '' } });
    };

    const removeOption = (key: string) => {
      if (optionKeys.length <= 2) return;
      const newOptions = { ...options };
      delete newOptions[key];
      setOptions(newOptions);
    };

    const updateOption = (key: string, field: string, value: string) => {
      setOptions({ ...options, [key]: { ...options[key], [field]: value } });
    };

    const handleSave = () => {
      onSave({ question, options, isEndpoint, endpointMessage, selectionMode });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-fade-in">
        <div className="absolute inset-4 bg-white rounded-lg flex flex-col animate-scale-in">
          <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
            <h3 className="text-xl font-bold">{node ? 'EDIT NODE' : 'ADD NEW NODE'}</h3>
            <p className="text-blue-100 mt-1">Configure question and selection mode</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {!isEndpoint && (
                <div className="animate-slide-in-right">
                  <label className="block text-sm font-bold mb-2">Question/Message</label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full p-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter your question..."
                  />
                </div>
              )}

              {/* Selection Mode Toggle */}
              {!isEndpoint && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200 animate-slide-in-left">
                  <label className="block text-sm font-bold mb-3 text-purple-800">Selection Mode</label>
                  <div className="flex gap-4">
                    <label className="flex items-center group cursor-pointer">
                      <input
                        type="radio"
                        name="selectionMode"
                        value="single"
                        checked={selectionMode === 'single'}
                        onChange={(e) => setSelectionMode(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-purple-700 font-medium group-hover:text-purple-900 transition-colors">Single Selection</span>
                      <span className="ml-2 text-xs text-purple-600">(Choose one option)</span>
                    </label>
                    <label className="flex items-center group cursor-pointer">
                      <input
                        type="radio"
                        name="selectionMode"
                        value="multiple"
                        checked={selectionMode === 'multiple'}
                        onChange={(e) => setSelectionMode(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-purple-700 font-medium group-hover:text-purple-900 transition-colors">Multiple Selection</span>
                      <span className="ml-2 text-xs text-purple-600">(Choose multiple options)</span>
                    </label>
                  </div>
                  <div className="mt-2 text-xs text-purple-600">
                    {selectionMode === 'single' 
                      ? '📍 Users will proceed immediately after selecting one option'
                      : '🎯 Users can select multiple options and then click continue'
                    }
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 animate-slide-in-right">
                <label className="flex items-center group cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEndpoint}
                    onChange={(e) => setIsEndpoint(e.target.checked)}
                    className="mr-3"
                  />
                  <span className="font-bold group-hover:text-yellow-800 transition-colors">This is an endpoint (final step)</span>
                </label>
              </div>

              {isEndpoint ? (
                <div className="animate-slide-in-left">
                  <label className="block text-sm font-bold mb-2">Final Message</label>
                  <textarea
                    value={endpointMessage}
                    onChange={(e) => setEndpointMessage(e.target.value)}
                    className="w-full p-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows={4}
                    placeholder="Enter the final result message..."
                  />
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg animate-slide-in-right">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-lg font-bold">Response Options ({optionKeys.length})</h4>
                      <p className="text-sm text-gray-600">
                        Mode: <span className={`font-bold ${selectionMode === 'multiple' ? 'text-purple-600' : 'text-blue-600'}`}>
                          {selectionMode === 'multiple' ? 'Multiple Selection' : 'Single Selection'}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={addOption}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transform hover:scale-105 transition-all duration-200"
                    >
                      + ADD OPTION
                    </button>
                  </div>

                  <div className="space-y-3">
                    {optionKeys.map((key, index) => (
                      <div key={key} className={`bg-white p-3 rounded border-2 ${
                        selectionMode === 'multiple' ? 'border-purple-200' : 'border-blue-200'
                      } hover:shadow-md transition-all duration-200 animate-slide-in-left`} style={{animationDelay: `${index * 100}ms`}}>
                        <div className="flex justify-between items-center mb-2">
                          <h5 className={`font-bold text-lg ${
                            selectionMode === 'multiple' ? 'text-purple-700' : 'text-blue-700'
                          }`}>
                            OPTION {index + 1}
                            {selectionMode === 'multiple' && <span className="ml-2 text-xs">✓ Multi-select</span>}
                          </h5>
                          {optionKeys.length > 2 && (
                            <button
                              onClick={() => removeOption(key)}
                              className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transform hover:scale-105 transition-all duration-200"
                            >
                              DELETE
                            </button>
                          )}
                        </div>

                        <div className="mb-2">
                          <label className="block text-sm font-bold mb-1">Option Text</label>
                          <input
                            type="text"
                            value={options[key].text}
                            onChange={(e) => updateOption(key, 'text', e.target.value)}
                            className="w-full p-2 border rounded transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={`Enter text for option ${index + 1}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold mb-1">Next Node</label>
                          <select
                            value={options[key].nextNodeId || ''}
                            onChange={(e) => updateOption(key, 'nextNodeId', e.target.value)}
                            className="w-full p-2 border rounded transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">-- Select Next Node --</option>
                            {availableNodes.map(nodeId => (
                              <option key={nodeId} value={nodeId}>{nodeId}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Selection Mode Preview */}
                  <div className={`mt-4 p-3 rounded-lg border-2 ${
                    selectionMode === 'multiple' 
                      ? 'bg-purple-100 border-purple-400' 
                      : 'bg-blue-100 border-blue-400'
                  } animate-pulse`}>
                    <p className={`font-bold text-center ${
                      selectionMode === 'multiple' ? 'text-purple-800' : 'text-blue-800'
                    }`}>
                      {selectionMode === 'multiple' 
                        ? `🎯 MULTIPLE SELECTION MODE - Users can choose multiple options from ${optionKeys.length} available`
                        : `📍 SINGLE SELECTION MODE - Users choose one option from ${optionKeys.length} available`
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t bg-gray-50 flex gap-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
            >
              SAVE CHANGES
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-600 transform hover:scale-105 transition-all duration-200"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    );
  };

  const addNode = (nodeData: any) => {
    const newId = generateNodeId();
    const newNode = {
      id: newId,
      question: nodeData.question,
      options: nodeData.options,
      selectionMode: nodeData.selectionMode || 'single',
      isEndpoint: nodeData.isEndpoint,
      endpointMessage: nodeData.endpointMessage || null
    };
    const updatedFlowchart = { ...flowchart, nodes: { ...flowchart.nodes, [newId]: newNode } };
    saveFlowchart(updatedFlowchart);
    setShowAddNode(false);
  };

  const updateNode = (nodeId: string, nodeData: any) => {
    const updatedNode = { 
      ...flowchart.nodes[nodeId], 
      question: nodeData.question,
      options: nodeData.options,
      selectionMode: nodeData.selectionMode || 'single',
      isEndpoint: nodeData.isEndpoint,
      endpointMessage: nodeData.endpointMessage || null
    };
    const updatedFlowchart = { ...flowchart, nodes: { ...flowchart.nodes, [nodeId]: updatedNode } };
    saveFlowchart(updatedFlowchart);
    setEditingNode(null);
  };

  const deleteNode = (nodeId: string) => {
    if (nodeId === flowchart.startNodeId) {
      alert("Cannot delete the start node!");
      return;
    }
    const newNodes = { ...flowchart.nodes };
    delete newNodes[nodeId];
    const updatedFlowchart = { ...flowchart, nodes: newNodes };
    saveFlowchart(updatedFlowchart);
  };

  const startUserFlow = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentNodeId(flowchart.startNodeId);
      setUserPath([]);
      setMode('user');
      setIsLoading(false);
    }, 800);
  };

  const handleChoice = (optionKey: string) => {
    const currentNode = flowchart.nodes[currentNodeId!];
    
    if (currentNode.selectionMode === 'multiple') {
      if (selectedOptions.includes(optionKey)) {
        setSelectedOptions(selectedOptions.filter(key => key !== optionKey));
      } else {
        setSelectedOptions([...selectedOptions, optionKey]);
      }
    } else {
      setIsTransitioning(true);
      setTimeout(() => {
        proceedWithSelection([optionKey]);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const confirmMultipleSelection = () => {
    if (selectedOptions.length === 0) {
      alert('Please select at least one option to proceed.');
      return;
    }
    setIsTransitioning(true);
    setTimeout(() => {
      proceedWithSelection(selectedOptions);
      setIsTransitioning(false);
    }, 300);
  };

  const proceedWithSelection = (selections: string[]) => {
    const currentNode = flowchart.nodes[currentNodeId!];
    const selectedTexts = selections.map(key => currentNode.options[key].text);
    
    const pathEntry = {
      nodeId: currentNodeId!,
      question: currentNode.question,
      selectedOptions: selections,
      selectedTexts: selectedTexts,
      selectedText: selectedTexts[0],
      selectionMode: currentNode.selectionMode,
      timestamp: new Date().toISOString()
    };

    setUserPath([...userPath, pathEntry]);
    setSelectedOptions([]);

    const nextNodeIds = selections
      .map(key => currentNode.options[key].nextNodeId)
      .filter(id => id !== null);

    // Collect endpoint messages for all next nodes
    if (nextNodeIds.length > 0) {
      const messages: string[] = [];
      nextNodeIds.forEach(id => {
        const node = flowchart.nodes[id];
        if (node && node.isEndpoint && node.endpointMessage) {
          messages.push(node.endpointMessage);
        }
      });
      setEndpointMessages(messages);
      setCurrentNodeId(nextNodeIds[0]); // Still advance to the first, but store all messages
    }
  };

  const resetFlow = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentNodeId(null);
      setUserPath([]);
      setMode('admin');
      setIsTransitioning(false);
    }, 300);
  };

  const exportPath = () => {
    if (userPath.length === 0) {
      alert('No path to export!');
      return;
    }

    const content = `TRADE INVESTIGATION JOURNEY
Generated: ${new Date().toLocaleString()}

YOUR PATH:
${userPath.map((step, index) => 
`${index + 1}. ${step.question}
   → ${step.selectedTexts ? step.selectedTexts.join(', ') : step.selectedText}
`).join('\n')}

OUTCOME:
${flowchart.nodes[currentNodeId!]?.endpointMessage || 'Complete!'}`;

    try {
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
      element.setAttribute('download', `investigation-${Date.now()}.txt`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      alert('✅ Download started!');
    } catch (error) {
      alert('Export not supported.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Loading your flowchart...</div>;
  }

  if (showPathView) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-2 animate-fade-in">
        <div className="w-full h-full bg-white rounded-xl overflow-hidden flex flex-col animate-scale-in">
          <div className="bg-white border-b px-4 py-3 flex justify-between items-center">
            <h2 className="text-lg font-bold">Trade Investigation Process Flow</h2>
            <button onClick={() => setShowPathView(false)} className="text-gray-500 hover:text-gray-700 transform hover:scale-110 transition-all duration-200">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 p-4 bg-gradient-to-br from-blue-50 to-purple-50 overflow-auto">
            <div className="text-center mb-4 animate-slide-in-down">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 rounded-full text-sm">
                <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></span>
                <span className="text-blue-700 font-medium">Your Investigation Path - {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="overflow-x-auto overflow-y-hidden">
              <div className="flex items-start gap-4 pb-4" style={{ minWidth: 'max-content' }}>
                
                <div className="flex flex-col items-center animate-slide-in-left">
                  <div className="w-16 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    START
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Begin</div>
                </div>

                {userPath.map((step, stepIndex) => {
                  const currentNode = Object.values(flowchart.nodes).find(node => node.question === step.question);
                  
                  return (
                    <React.Fragment key={stepIndex}>
                      <div className="flex items-center mt-6 animate-slide-in-right" style={{animationDelay: `${stepIndex * 200}ms`}}>
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                      </div>
                      
                      <div className="flex flex-col items-center animate-slide-in-up" style={{animationDelay: `${stepIndex * 200 + 100}ms`}}>
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg text-center w-48 mb-3 shadow-lg">
                          <div className="text-xs font-bold mb-1">STEP {stepIndex + 1}</div>
                          <div className="text-xs leading-tight">
                            {step.question.length > 50 ? step.question.substring(0, 50) + '...' : step.question}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 w-48">
                          {currentNode && Object.entries(currentNode.options).map(([optionKey, option], index) => {
                            const typedOption = option as { text: string; nextNodeId: string | null };
                            const isSelected = step.selectedOptions ? step.selectedOptions.includes(optionKey) : (step.selectedText === typedOption.text);
                            return (
                              <div key={optionKey} className={`p-2 rounded border-2 text-xs transition-all duration-300 ${
                                isSelected
                                  ? 'bg-green-100 border-green-500 text-green-800 font-bold shadow-md transform scale-105' 
                                  : 'bg-gray-100 border-gray-300 text-gray-600'
                              }`}>
                                <div className="flex items-center gap-1">
                                  {isSelected && <span className="text-green-500">✓</span>}
                                  <span>{String.fromCharCode(65 + index)}) {typedOption.text}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-2 text-xs font-bold text-green-600 animate-pulse max-w-48">
                          <div className="text-center">CHOSEN:</div>
                          {step.selectedTexts ? 
                            step.selectedTexts.map((text, idx) => (
                              <div key={idx} className={`${text.length > 15 ? 'block' : 'inline'} ${idx > 0 && text.length <= 15 ? 'ml-1' : ''}`}>
                                {text}{idx < step.selectedTexts!.length - 1 && text.length <= 15 ? ',' : ''}
                              </div>
                            )) : 
                            <div className={step.selectedText && step.selectedText.length > 15 ? 'block' : 'inline'}>
                              {step.selectedText}
                            </div>
                          }
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}

                <div className="flex items-center mt-6 animate-slide-in-right" style={{animationDelay: `${userPath.length * 200}ms`}}>
                  <ChevronRight className="w-6 h-6 text-green-500" />
                </div>

                <div className="flex flex-col items-center animate-slide-in-up" style={{animationDelay: `${userPath.length * 200 + 100}ms`}}>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-lg text-center w-56 shadow-lg">
                    <div className="text-xs font-bold mb-1">🎯 RESULT</div>
                    <div className="text-xs leading-tight">
                      {endpointMessages.length > 1 ? (
                        <ul className="text-gray-700 text-lg leading-relaxed animate-slide-in-up list-disc list-inside">
                          {endpointMessages.map((msg, idx) => (
                            <li key={idx}>{msg}</li>
                          ))}
                        </ul>
                      ) : (
                        flowchart.nodes[currentNodeId!]?.endpointMessage || 'Complete!'
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center mt-6 animate-slide-in-right" style={{animationDelay: `${userPath.length * 200 + 200}ms`}}>
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </div>

                <div className="flex flex-col items-center animate-slide-in-up" style={{animationDelay: `${userPath.length * 200 + 300}ms`}}>
                  <div className="w-16 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    END
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Complete</div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white rounded-lg p-4 shadow-lg animate-slide-in-up">
              <h3 className="font-bold text-gray-800 mb-3 text-center">Investigation Path Summary</h3>
              
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {userPath.map((step, index) => (
                  <div key={index} className="inline-flex items-center animate-slide-in-left" style={{animationDelay: `${index * 100}ms`}}>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium hover:bg-blue-200 transition-colors">
                      {step.selectedTexts ? step.selectedTexts.join(', ') : step.selectedText}
                    </span>
                    {index < userPath.length - 1 && (
                      <ChevronRight className="w-3 h-3 mx-1 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 p-3 rounded animate-slide-in-up">
                <div className="text-sm font-bold text-green-800 mb-2">🎯 Investigation Outcome:</div>
                <div className="text-sm text-green-700 leading-relaxed">
                  {endpointMessages.length > 1 ? (
                    <ul className="text-gray-700 text-lg leading-relaxed animate-slide-in-up list-disc list-inside">
                      {endpointMessages.map((msg, idx) => (
                        <li key={idx}>{msg}</li>
                      ))}
                    </ul>
                  ) : (
                    flowchart.nodes[currentNodeId!]?.endpointMessage || 'Trade investigation process complete!'
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-center gap-6 text-center">
                <div className="animate-bounce" style={{animationDelay: '1s'}}>
                  <div className="text-lg font-bold text-blue-500">{userPath.length}</div>
                  <div className="text-xs text-gray-600">Investigation Steps</div>
                </div>
                <div className="animate-bounce" style={{animationDelay: '1.2s'}}>
                  <div className="text-lg font-bold text-purple-500">✓</div>
                  <div className="text-xs text-gray-600">Complete</div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t p-2 bg-white flex gap-2 justify-center">
            <button onClick={exportPath} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded text-sm hover:from-blue-600 hover:to-purple-700 flex items-center transform hover:scale-105 transition-all duration-200">
              <Download className="w-3 h-3 mr-1" />Export
            </button>
            <button onClick={() => setShowPathView(false)} className="bg-gray-500 text-white px-4 py-1 rounded text-sm hover:bg-gray-600 transform hover:scale-105 transition-all duration-200">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6 animate-slide-in-down">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Trade Investigation Admin
              </h1>
              <p className="text-gray-600 mt-1">Manage your investigation flowchart</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowAddNode(true)} 
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 flex items-center transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />Add Node
              </button>
              <button 
                onClick={startUserFlow} 
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 flex items-center transform hover:scale-105 transition-all duration-200 shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Starting...' : 'Test'}
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {Object.values(flowchart.nodes).map((node, index) => (
              <div key={node.id} className="bg-white p-4 rounded-lg shadow-lg border hover:shadow-xl transition-all duration-300 animate-slide-in-left" style={{animationDelay: `${index * 100}ms`}}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">{node.id}</span>
                      {node.id === flowchart.startNodeId && <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-2 py-1 rounded text-sm animate-pulse">START</span>}
                      {node.isEndpoint && <span className="bg-gradient-to-r from-red-100 to-red-200 text-red-800 px-2 py-1 rounded text-sm">ENDPOINT</span>}
                    </div>
                    {node.isEndpoint ? (
                      <p className="text-gray-700 font-medium">Endpoint: {node.endpointMessage}</p>
                    ) : (
                      <>
                        <p className="text-gray-700 font-medium mb-2">{node.question}</p>
                        <div className="text-sm text-gray-600">
                          {Object.entries(node.options).map(([key, option]) => {
                            const typedOption = option as { text: string; nextNodeId: string | null };
                            return (
                              <div key={key} className="hover:text-gray-800 transition-colors">• {typedOption.text} → {typedOption.nextNodeId || 'None'}</div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingNode(node)} 
                      className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transform hover:scale-110 transition-all duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteNode(node.id)} 
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transform hover:scale-110 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showAddNode && <NodeForm onSave={addNode} onCancel={() => setShowAddNode(false)} />}
        {editingNode && <NodeForm node={editingNode} onSave={(data: any) => updateNode(editingNode.id, data)} onCancel={() => setEditingNode(null)} />}
      </div>
    );
  }

  const currentNode = currentNodeId ? flowchart.nodes[currentNodeId] : null;

  if (!currentNode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center animate-fade-in">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Investigation Complete!</h1>
          <button 
            onClick={resetFlow} 
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Back to Admin
          </button>
        </div>
      </div>
    );
  }

  if (currentNode.isEndpoint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center animate-scale-in">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <span className="text-2xl">🎯</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 animate-slide-in-down">Investigation Result</h2>
            {endpointMessages.length > 1 ? (
              <ul className="text-gray-700 text-lg leading-relaxed animate-slide-in-up list-disc list-inside">
                {endpointMessages.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700 text-lg leading-relaxed animate-slide-in-up">{currentNode.endpointMessage}</p>
            )}
          </div>

          <div className="flex gap-3 animate-slide-in-up" style={{animationDelay: '0.3s'}}>
            <button 
              onClick={() => { 
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentNodeId(flowchart.startNodeId); 
                  setUserPath([]); 
                  setIsTransitioning(false);
                  setEndpointMessages([]);
                }, 300);
              }} 
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center justify-center transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />Start Over
            </button>
            <button 
              onClick={() => setShowPathView(true)} 
              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 flex items-center justify-center transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <Eye className="w-4 h-4 mr-2" />View Path
            </button>
          </div>
          
          <button 
            onClick={resetFlow} 
            className="w-full mt-3 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transform hover:scale-105 transition-all duration-200"
          >
            Back to Admin
          </button>
        </div>
      </div>
    );
  }

  const optionEntries = Object.entries(currentNode.options);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4 transition-all duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100 animate-fade-in'}`}>
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 animate-scale-in">
        <div className="text-center mb-8 animate-slide-in-up">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{currentNode.question}</h2>
          {currentNode.selectionMode === 'multiple' && (
            <div className="mb-4">
              <div className="bg-gradient-to-r from-purple-100 to-purple-200 border border-purple-300 rounded-lg p-3 mb-4 animate-pulse">
                <p className="text-purple-800 text-sm font-medium">📋 Multiple Selection: Choose all that apply</p>
              </div>
              {selectedOptions.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3 animate-slide-in-left">
                  <p className="text-blue-800 text-sm font-medium mb-2">Selected ({selectedOptions.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedOptions.map(optionKey => (
                      <span key={optionKey} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-1 rounded text-xs animate-bounce">
                        {currentNode.options[optionKey].text}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {optionEntries.map(([optionKey, option], index) => {
            const typedOption = option as { text: string; nextNodeId: string | null };
            const isSelected = selectedOptions.includes(optionKey);
            const isMultiple = currentNode.selectionMode === 'multiple';
            
            return (
              <button
                key={optionKey}
                onClick={() => handleChoice(optionKey)}
                className={`w-full p-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-between group animate-slide-in-right shadow-lg ${
                  isMultiple
                    ? isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-2 border-purple-800 shadow-purple-300'
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-blue-300'
                }`}
                style={{animationDelay: `${index * 100}ms`}}
              >
                <div className="flex items-center">
                  {isMultiple && (
                    <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                      isSelected ? 'bg-white border-white scale-110' : 'border-white hover:scale-110'
                    }`}>
                      {isSelected && <span className="text-purple-600 text-sm animate-bounce">✓</span>}
                    </div>
                  )}
                  <span className="font-medium">{typedOption.text}</span>
                </div>
                {!isMultiple && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            );
          })}
        </div>

        {currentNode.selectionMode === 'multiple' && (
          <div className="mt-6 animate-slide-in-up" style={{animationDelay: '0.4s'}}>
            <button
              onClick={confirmMultipleSelection}
              disabled={selectedOptions.length === 0}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-bold shadow-lg"
            >
              Continue with Selected Options ({selectedOptions.length})
            </button>
          </div>
        )}

        <button 
          onClick={resetFlow} 
          className="w-full mt-4 text-gray-500 hover:text-gray-700 transition-colors text-sm hover:scale-105 transform duration-200"
        >
          Back to Admin Panel
        </button>
      </div>
    </div>
  );
};

export default FlowchartApp;
