import SidebarArea from "../Areas/Sidebar/SidebarArea"
import TileArea from "../Areas/TileArea"
import SceneArea from "../Areas/SceneArea/SceneArea"
import CanvasArea from "../Areas/canvas/CanvasArea"
import CharacterArea from "../Areas/CharacterArea/CharacterArea"
import InspectorArea from "../Areas/Inspector/InspectorArea"

import './EditorLayout.css'


export default function EditorLayout() {
    return (
		<div className="editor-layout">
			<SidebarArea />
			<TileArea />
			<SceneArea />
			<CanvasArea />
			<CharacterArea />
			<InspectorArea />
		</div>
	)
}