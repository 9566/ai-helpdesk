import React from 'react';
import { FileText, ThumbsUp, HelpCircle, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import './AIAnswerBlock.css';

interface AIAnswerBlockProps {
  content: string;
  citation?: string;
  noMatch?: boolean;
  onSolved?: () => void;
  onNeedHelp?: () => void;
}

export function AIAnswerBlock({ content, citation, noMatch, onSolved, onNeedHelp }: AIAnswerBlockProps) {
  if (noMatch) {
    return (
      <div className="ai-answer ai-answer--no-match">
        <div className="ai-answer__no-match-header">
          <AlertCircle size={16} aria-hidden />
          <span>I couldn't find relevant information in our knowledge base for this question.</span>
        </div>
        <p className="ai-answer__no-match-sub">
          Our knowledge base may not cover this topic yet. Create a support ticket and an agent will help you directly.
        </p>
        {onNeedHelp && (
          <Button variant="secondary" size="sm" onClick={onNeedHelp} icon={<HelpCircle size={13} />}>
            Create a ticket instead
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="ai-answer">
      <div className="ai-answer__body">
        {content.split('\n').map((line, i) =>
          line.trim()
            ? <p key={i}>{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
            : <br key={i} />
        )}
      </div>
      {citation && (
        <div className="ai-answer__citation">
          <FileText size={12} aria-hidden />
          <span>Source: <strong>{citation}</strong></span>
        </div>
      )}
      <div className="ai-answer__actions">
        {onSolved && (
          <Button variant="secondary" size="sm" onClick={onSolved} icon={<ThumbsUp size={13} />}>
            This solved it
          </Button>
        )}
        {onNeedHelp && (
          <Button variant="ghost" size="sm" onClick={onNeedHelp} icon={<HelpCircle size={13} />}>
            I still need help
          </Button>
        )}
      </div>
    </div>
  );
}
