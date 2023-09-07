import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import './TextEditor.css';

const toolBarOptions = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['bold', 'italic', 'underline'],
  [{ color: [] }, { background: [] }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ align: [] }],
  ['blockquote', 'code-block'],
  ['clean'],
];

export default function TextEditor() {
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);
  const editorWrapperRef = useRef(null);
  const { id: documentId } = useParams();

  useEffect(() => {
    const s = io('http://localhost:3000');
    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (editorWrapperRef.current === null) {
      return;
    }

    const editorWrapper = editorWrapperRef.current;
    const editor = document.createElement('div');
    editorWrapper.append(editor);
    const quillEditor = new Quill(editor, {
      theme: 'snow',
      modules: {
        toolbar: toolBarOptions,
        clipboard: {
          matchVisual: false,
        },
      },
    });
    quillEditor.disable();
    setQuill(quillEditor);
    return () => (editorWrapper.innerHTML = '');
  }, [editorWrapperRef]);

  useEffect(() => {
    if (socket === null || quill === null) {
      return;
    }

    function handler(delta, oldDelta, source) {
      if (source !== 'user') {
        return;
      }

      socket.emit('send-changes', { delta, data: quill.getContents() });
    }

    quill.on('text-change', handler);

    return () => quill.off('text-change', handler);
  });

  useEffect(() => {
    if (socket === null || quill === null) {
      return;
    }

    function handler(delta) {
      quill.updateContents(delta);
    }

    socket.on('changes-received', handler);

    return () => socket.off('changes-received', handler);
  });

  useEffect(() => {
    if (socket === null || quill === null) {
      return;
    }

    function handler(data) {
      quill.setContents(data);
      quill.enable();
    }

    socket.on('load-document', handler);

    socket.emit('get-document', documentId);

    return () => socket.off('load-document', handler);
  }, [socket, quill, documentId]);

  return (
    <div
      className='editor-wrapper'
      ref={editorWrapperRef}
    ></div>
  );
}
