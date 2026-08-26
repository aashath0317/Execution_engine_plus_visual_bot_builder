import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/[0.08] bg-black/20">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn("p-1.5 rounded transition-colors", editor.isActive('bold') ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5")}
        title="Bold"
      ><Bold size={16} /></button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn("p-1.5 rounded transition-colors", editor.isActive('italic') ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5")}
        title="Italic"
      ><Italic size={16} /></button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn("p-1.5 rounded transition-colors", editor.isActive('strike') ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5")}
        title="Strikethrough"
      ><Strikethrough size={16} /></button>

      <div className="w-px h-4 bg-white/[0.08] mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn("p-1.5 rounded transition-colors", editor.isActive('heading', { level: 1 }) ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5")}
        title="Heading 1"
      ><Heading1 size={16} /></button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn("p-1.5 rounded transition-colors", editor.isActive('heading', { level: 2 }) ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5")}
        title="Heading 2"
      ><Heading2 size={16} /></button>

      <div className="w-px h-4 bg-white/[0.08] mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn("p-1.5 rounded transition-colors", editor.isActive('bulletList') ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5")}
        title="Bullet List"
      ><List size={16} /></button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn("p-1.5 rounded transition-colors", editor.isActive('orderedList') ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5")}
        title="Ordered List"
      ><ListOrdered size={16} /></button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn("p-1.5 rounded transition-colors", editor.isActive('blockquote') ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5")}
        title="Quote"
      ><Quote size={16} /></button>
    </div>
  );
};

const RichTextEditor = ({ content, onChange, placeholder, className }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-invert focus:outline-none min-h-[200px] overflow-y-auto p-4 text-sm text-gray-300 [&>p]:mt-0 [&>p]:mb-2 [&>h1]:text-white [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-3 [&>h2]:text-white [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mb-2 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>blockquote]:border-l-2 [&>blockquote]:border-[#00FF9D] [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:text-gray-400',
      },
    },
  });

  // Keep content synced if updated externally (like when modal opens)
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  return (
    <div className={cn("bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden focus-within:border-[#00FF9D]/30 transition-colors flex flex-col", className)}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="cursor-text flex-1 overflow-y-auto" />
    </div>
  );
};

export default RichTextEditor;
