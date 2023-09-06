import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import QuillMarkdown from 'quilljs-markdown';
import { useEffect, useRef } from 'react';
import './TextEditor.css';

export default function TextEditor() {
  const editorWrapperRef = useRef(null);

  useEffect(() => {
    if (editorWrapperRef.current === null) {
      return;
    }

    const editorWrapper = editorWrapperRef.current;
    const editor = document.createElement('div');
    editorWrapper.append(editor);
    const quillEditor = new Quill(editor, { theme: 'snow' });
    new QuillMarkdown(quillEditor);
    return () => (editorWrapper.innerHTML = '');
  }, [editorWrapperRef]);

  return (
    <div
      className='editor-wrapper'
      ref={editorWrapperRef}
    ></div>
  );
}
