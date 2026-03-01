import React from 'react'
import SidebarArea from './SidebarArea'
import TileArea from './TileArea'
import ScenesArea from './ScenesArea'
import CanvasArea from './CanvasArea'
import CharacterArea from './CharacterArea'
import InspectorArea from './InspectorArea'

// 6 column - 5 rows layout
export default function EditorLayout() {
	return (
		<div className="editor-layout">
			<SidebarArea />
			<TileArea />
			<ScenesArea />
			<CanvasArea />
			<CharacterArea />
			<InspectorArea />
		</div>
	)
}
