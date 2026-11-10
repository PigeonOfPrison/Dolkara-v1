
import { FiHome, FiFolder, FiSave, FiDownload, FiSettings, FiPlus } from 'react-icons/fi';
import { HiOutlineSaveAs } from 'react-icons/hi';
import { useEditorStore } from '../../../../state/editorStore';
import { loadProjectFromFile } from '../../../../utils/fileIO';
import './Sidebar.css';

/**
 * Sidebar - Icon navigation panel
 * Contains action buttons for file operations and settings
 */
export default function Sidebar() {
  const createNewProject = useEditorStore(state => state.createNewProject);
  const loadProject = useEditorStore(state => state.loadProject);
  const saveProject = useEditorStore(state => state.saveProject);
  const saveProjectAs = useEditorStore(state => state.saveProjectAs);
  const exportScene = useEditorStore(state => state.exportScene);
  const currentSceneId = useEditorStore(state => state.currentSceneId);

  const handleNewProject = async () => {
    console.log('[Sidebar] Creating new project...');
    createNewProject();
  };

  const handleLoadProject = async () => {
    console.log('[Sidebar] Loading project...');
    const res = await loadProjectFromFile();
    if (res) {
      loadProject(res.data);
    }
  };

  const handleQuickSave = async () => {
    console.log('[Sidebar] Quick saving project...');
    await saveProject();
  };

  const handleSaveAs = async () => {
    console.log('[Sidebar] Save As project...');
    await saveProjectAs();
  };

  const handleExportScene = async () => {
    console.log('[Sidebar] Exporting current scene...');
    await exportScene(currentSceneId);
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