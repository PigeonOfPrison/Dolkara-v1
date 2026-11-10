export default function InspectorArea() {
    return (
        <aside className="inspector-area">
            <div className="panel-header">
                <span className="panel-header__title">Inspector</span>
            </div>
            <div className="panel-body">
                <div className="placeholder">
                    <span className="placeholder__icon">🔍</span>
                    <span className="placeholder__text">Properties</span>
                </div>
            </div>
        </aside>
    );
}