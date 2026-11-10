import type { Tab } from "../../../state/types";

// styles
import './PanelHeader.css';

/****
 * PanelHeader - Common header component for all panels
 * Displays the panel title and optional action buttons
 * 
 **/

interface PanelHeaderProps {
    title?: string;
    tabs?: Tab[];
    onTabChange?: (tabId: string) => void;
}

export default function PanelHeader( {title, tabs, onTabChange}: Readonly<PanelHeaderProps>) {

    if(tabs && tabs.length > 0) {
        return (
            <div className="panel-header panel-header-tabs">
                {tabs.map(tab => (
                    <button
                        key = {tab.id}
                        className = {`panel-tab ${tab.active? 'active' : ''}`}
                        onClick= {() => onTabChange?.(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        );
    }
    

    return (
        <div className="panel-header">
            {title}
        </div>
    );
}