import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageButton {
  text: string;
  type: 'url' | 'callback';
  url?: string;
  callback_data?: string;
}

interface ChatMessageRendererProps {
  content: string | null;
  buttons?: MessageButton[] | null;
  isOutgoing?: boolean;
  className?: string;
}

/**
 * Parse Telegram-style formatting to React elements
 * Supports: *bold*, _italic_, `code`, ```pre```, [text](url)
 */
function parseFormattedText(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let currentIndex = 0;
  let key = 0;

  // Regex patterns for Telegram markdown-style formatting
  const patterns = [
    // Bold: *text* or **text**
    { regex: /\*\*([^*]+)\*\*|\*([^*]+)\*/g, render: (match: string) => <strong key={key++}>{match}</strong> },
    // Italic: _text_ or __text__
    { regex: /__([^_]+)__|_([^_]+)_/g, render: (match: string) => <em key={key++}>{match}</em> },
    // Code block: ```text```
    { regex: /```([^`]+)```/g, render: (match: string) => <code key={key++} className="bg-black/20 rounded px-1.5 py-0.5 text-xs font-mono block my-1 whitespace-pre-wrap">{match}</code> },
    // Inline code: `text`
    { regex: /`([^`]+)`/g, render: (match: string) => <code key={key++} className="bg-black/20 rounded px-1 py-0.5 text-xs font-mono">{match}</code> },
    // Strikethrough: ~text~
    { regex: /~([^~]+)~/g, render: (match: string) => <del key={key++}>{match}</del> },
    // Links: [text](url)
    { regex: /\[([^\]]+)\]\(([^)]+)\)/g, render: (text: string, url: string) => <a key={key++} href={url} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">{text}</a> },
  ];

  // Combined regex to find all formatting
  const combinedRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|_[^_]+_|```[^`]+```|`[^`]+`|~[^~]+~|\[[^\]]+\]\([^)]+\))/g;
  
  let match;
  while ((match = combinedRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > currentIndex) {
      elements.push(<span key={key++}>{text.slice(currentIndex, match.index)}</span>);
    }
    
    const matchedText = match[0];
    
    // Determine which pattern matched and render accordingly
    if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
      elements.push(<strong key={key++}>{matchedText.slice(2, -2)}</strong>);
    } else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
      elements.push(<strong key={key++}>{matchedText.slice(1, -1)}</strong>);
    } else if (matchedText.startsWith('__') && matchedText.endsWith('__')) {
      elements.push(<em key={key++}>{matchedText.slice(2, -2)}</em>);
    } else if (matchedText.startsWith('_') && matchedText.endsWith('_')) {
      elements.push(<em key={key++}>{matchedText.slice(1, -1)}</em>);
    } else if (matchedText.startsWith('```') && matchedText.endsWith('```')) {
      elements.push(
        <code key={key++} className="bg-black/20 rounded px-1.5 py-0.5 text-xs font-mono block my-1 whitespace-pre-wrap">
          {matchedText.slice(3, -3)}
        </code>
      );
    } else if (matchedText.startsWith('`') && matchedText.endsWith('`')) {
      elements.push(
        <code key={key++} className="bg-black/20 rounded px-1 py-0.5 text-xs font-mono">
          {matchedText.slice(1, -1)}
        </code>
      );
    } else if (matchedText.startsWith('~') && matchedText.endsWith('~')) {
      elements.push(<del key={key++}>{matchedText.slice(1, -1)}</del>);
    } else if (matchedText.startsWith('[')) {
      const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(matchedText);
      if (linkMatch) {
        elements.push(
          <a key={key++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">
            {linkMatch[1]}
          </a>
        );
      }
    }
    
    currentIndex = match.index + matchedText.length;
  }
  
  // Add remaining text
  if (currentIndex < text.length) {
    elements.push(<span key={key++}>{text.slice(currentIndex)}</span>);
  }
  
  return elements.length > 0 ? elements : [<span key={0}>{text}</span>];
}

/**
 * Parse HTML-style formatting to React elements
 * Supports: <b>, <strong>, <i>, <em>, <code>, <pre>, <a>, <s>, <u>
 */
function parseHtmlText(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let key = 0;

  // Simple HTML tag parser
  const htmlRegex = /<(b|strong|i|em|code|pre|s|u|a)(?:\s+href="([^"]*)")?>(.*?)<\/\1>/gs;
  let currentIndex = 0;
  let match;

  while ((match = htmlRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > currentIndex) {
      elements.push(<span key={key++}>{text.slice(currentIndex, match.index)}</span>);
    }

    const [, tag, href, content] = match;
    
    switch (tag) {
      case 'b':
      case 'strong':
        elements.push(<strong key={key++}>{content}</strong>);
        break;
      case 'i':
      case 'em':
        elements.push(<em key={key++}>{content}</em>);
        break;
      case 'code':
        elements.push(<code key={key++} className="bg-black/20 rounded px-1 py-0.5 text-xs font-mono">{content}</code>);
        break;
      case 'pre':
        elements.push(<code key={key++} className="bg-black/20 rounded px-1.5 py-0.5 text-xs font-mono block my-1 whitespace-pre-wrap">{content}</code>);
        break;
      case 's':
        elements.push(<del key={key++}>{content}</del>);
        break;
      case 'u':
        elements.push(<u key={key++}>{content}</u>);
        break;
      case 'a':
        elements.push(
          <a key={key++} href={href || '#'} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">
            {content}
          </a>
        );
        break;
      default:
        elements.push(<span key={key++}>{content}</span>);
    }

    currentIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    elements.push(<span key={key++}>{text.slice(currentIndex)}</span>);
  }

  return elements.length > 0 ? elements : [<span key={0}>{text}</span>];
}

/**
 * Parse message content with Telegram formatting
 */
function parseMessageContent(content: string): React.ReactNode[] {
  // Check if content contains HTML tags
  const hasHtmlTags = /<(b|strong|i|em|code|pre|s|u|a)\b/i.test(content);
  
  if (hasHtmlTags) {
    return parseHtmlText(content);
  }
  
  // Check for markdown-style formatting
  const hasMarkdown = /(\*[^*]+\*|_[^_]+_|`[^`]+`|~[^~]+~|\[[^\]]+\]\([^)]+\))/.test(content);
  
  if (hasMarkdown) {
    return parseFormattedText(content);
  }
  
  // Plain text - just return as is
  return [<span key={0}>{content}</span>];
}

export function ChatMessageRenderer({ 
  content, 
  buttons,
  isOutgoing = false,
  className 
}: ChatMessageRendererProps) {
  if (!content && (!buttons || buttons.length === 0)) {
    return null;
  }

  // Parse buttons from JSON string if needed
  let parsedButtons: MessageButton[] = [];
  if (buttons) {
    if (typeof buttons === 'string') {
      try {
        parsedButtons = JSON.parse(buttons);
      } catch {
        parsedButtons = [];
      }
    } else if (Array.isArray(buttons)) {
      parsedButtons = buttons;
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {content && (
        <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {parseMessageContent(content)}
        </div>
      )}
      
      {parsedButtons.length > 0 && (
        <div className="flex flex-col gap-1 mt-2">
          {parsedButtons.map((btn, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (btn.type === 'url' && btn.url) {
                  window.open(btn.url, '_blank');
                }
              }}
              className={cn(
                "w-full py-2 px-3 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5",
                isOutgoing
                  ? "bg-white/20 hover:bg-white/30 text-white"
                  : "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
              )}
            >
              {btn.type === 'url' && <ExternalLink className="h-3 w-3" />}
              {btn.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
