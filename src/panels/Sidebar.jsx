import React from 'react'
import { FiHome, FiFolder, FiSave, FiDownload, FiSettings, FiPlus } from 'react-icons/fi'
import { HiOutlineSaveAs } from 'react-icons/hi'
import useEditorStore from '../state/editorStore'
import '../css/Sidebar.css'

/**
 * Sidebar - Icon navigation panel
 * Contains action buttons for file operations and settings
 */
export default function Sidebar() {
  const newProject = useEditorStore(state => state.newProject);
  const loadProject = useEditorStore(state => state.loadProject);
  const quickSave = useEditorStore(state => state.quickSave);
  const saveProject = useEditorStore(state => state.saveProject);
  const exportCurrentScene = useEditorStore(state => state.exportCurrentScene);

  const handleNewProject = async () => {
    console.log('[Sidebar] Creating new project...');
    await newProject();
  };

  const handleLoadProject = async () => {
    console.log('[Sidebar] Loading project...');
    await loadProject();
  };

  const handleQuickSave = async () => {
    console.log('[Sidebar] Quick saving project...');
    await quickSave();
  };

  const handleSaveAs = async () => {
    console.log('[Sidebar] Save As project...');
    await saveProject();
  };

  const handleExportScene = async () => {
    console.log('[Sidebar] Exporting current scene...');
    await exportCurrentScene();
  };

  return (
    <div className="icon-list">
      <button className="sidebar-icon" title="New Project" onClick={handleNewProject}>
        <FiPlus size={25} />
      </button>
      <button className="sidebar-icon" title="Dashboard">
        <FiHome size={25} />
      </button>
      <button className="sidebar-icon" title="Open Project" onClick={handleLoadProject}>
        <FiFolder size={25} />
      </button>
      <button className="sidebar-icon" title="Save Project (Ctrl+S)" onClick={handleQuickSave}>
        <FiSave size={25} />
      </button>
      <button className="sidebar-icon" title="Save As..." onClick={handleSaveAs}>
        <HiOutlineSaveAs size={25} />
      </button>
      <button className="sidebar-icon" title="Export Scene JSON" onClick={handleExportScene}>
        <FiDownload size={25} />
      </button>
      <button className="sidebar-icon" title="Settings">
        <FiSettings size={25} />
      </button>
    </div>
  )
}
