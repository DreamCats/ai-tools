import { ChatSession } from '../domain/chat';

export class ExportUtils {
  static exportToMarkdown(session: ChatSession, filename: string = 'chat-export.md') {
    const { title, messages, createdAt } = session;
    const content = [
      `# ${title}`,
      `\n创建时间：${new Date(createdAt).toLocaleString()}\n`,
      '## 对话内容\n',
      ...messages.map(msg => {
        const role = msg.role === 'user' ? '👤 用户' : '🤖 助手';
        const time = new Date(msg.timestamp).toLocaleString();
        return `### ${role} (${time})\n\n${msg.content}\n\n---\n`;
      })
    ].join('\n');

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  static exportToJSON(session: ChatSession, filename: string = 'chat-export.json') {
    const content = JSON.stringify(session, null, 2);
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  static exportToTXT(session: ChatSession, filename: string = 'chat-export.txt') {
    const { title, messages, createdAt } = session;
    const content = [
      `标题：${title}`,
      `创建时间：${new Date(createdAt).toLocaleString()}`,
      '\n对话内容：\n',
      ...messages.map(msg => {
        const role = msg.role === 'user' ? '用户' : '助手';
        const time = new Date(msg.timestamp).toLocaleString();
        return `[${role} - ${time}]\n${msg.content}\n\n`;
      })
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }
} 