
import React from 'react';
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";

interface InvestigationProgressProps {
  userPath: Array<{
    nodeId: string;
    question: string;
    selectedTexts?: string[];
    selectedText?: string;
  }>;
  currentStep: number;
}

const InvestigationProgress: React.FC<InvestigationProgressProps> = ({ userPath, currentStep }) => {
  const steps = userPath.map((step, index) => ({
    step: index + 1,
    title: `Step ${index + 1}`,
    description: step.selectedTexts ? step.selectedTexts.join(', ') : step.selectedText || '',
  }));

  // Add current step if not at the end
  if (currentStep <= steps.length) {
    steps.push({
      step: steps.length + 1,
      title: `Step ${steps.length + 1}`,
      description: 'Current decision...',
    });
  }

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg p-4 animate-slide-in-left">
      <div className="mb-4">
        <h3 className="font-bold text-gray-800 mb-1">Investigation Progress</h3>
        <p className="text-xs text-gray-600">Your journey through the trade investigation</p>
      </div>
      
      <Stepper value={currentStep} orientation="vertical" className="w-full">
        {steps.map(({ step, title, description }, index) => (
          <StepperItem
            key={step}
            step={step}
            completed={step < currentStep}
            className="relative items-start [&:not(:last-child)]:flex-1"
          >
            <StepperTrigger className="items-start pb-6 last:pb-0" asChild>
              <div className="flex items-start gap-3">
                <StepperIndicator className="mt-0.5" />
                <div className="space-y-0.5 text-left min-w-0 flex-1">
                  <StepperTitle className="text-xs font-medium">
                    {title}
                  </StepperTitle>
                  <StepperDescription className="text-xs leading-tight break-words">
                    {description.length > 50 ? description.substring(0, 47) + '...' : description}
                  </StepperDescription>
                </div>
              </div>
            </StepperTrigger>
            {step < steps.length && (
              <StepperSeparator className="absolute left-3 top-[calc(1.5rem+0.125rem)] h-[calc(100%-1.5rem-0.25rem)] w-0.5 -translate-x-1/2" />
            )}
          </StepperItem>
        ))}
      </Stepper>
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Progress:</span>
          <span>{Math.round((currentStep / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default InvestigationProgress;
