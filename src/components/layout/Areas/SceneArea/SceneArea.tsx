import PanelHeader from '../../../Commons/PanelHeader/PanelHeader'
import SceneList from './SceneList'

export default function ScenesArea() {
  return (
    <section className="scenes-menu panel">
      <PanelHeader title="Scenes" />
      <div className="panel-body">
        <SceneList />
      </div>
    </section>
  )
}