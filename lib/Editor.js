"use client"
import React, { useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import JoditEditor, disabling SSR (server-side rendering)
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

const Editor = ({ formData, setFormData }) => {
  const editor = useRef(null);

  // Editor configuration
  const config = useMemo(() => ({
    readonly: false, // allows editing
    placeholder: 'Start typing...', // placeholder text
  }), []);

  // Handle content update when the editor loses focus
  const handleBlur = (newContent) => {
    setFormData((prev) => ({
      ...prev,
      content: newContent, // Update the content field of the form data
    }));
  };

  return (
    <JoditEditor
      ref={editor}
      value={formData.content} // Use formData.content to bind to the editor
      config={config}
      tabIndex={1} // Tab index for focusing
      onBlur={handleBlur} // Capture content when the editor loses focus
      onChange={() => {}} // Optional: You can use onChange if you need to perform additional actions on input
    />
  );
};

export default Editor;