import React, { useState, useEffect } from 'react';
import type { ConflictSubtab } from '../types';
import {
  SubtabNavigation,
  ACLEDSubtab,
  UCDPSubtab,
  VIINASubtab,
  BellingcatSubtab,
  ComparisonSubtab,
} from './conflict';
import { ACLED_EVENT_TYPES } from '../types';
import type { ACLEDEventType } from '../types';

// VIINA sources from the data
const VIINA_SOURCES = [
  'liveuamap', 'ria', 'pravdaua', 'nv', 'unian', 'espreso',
  'interfaxua', '24tvua', 'liga', 'meduza', 'ntv', 'ng',
  'militarnyy', 'mz', 'forbesua', 'kp'
] as const;

type ViinaSource = typeof VIINA_SOURCES[number];

const SOURCE_LABELS: Record<string, string> = {
  'liveuamap': 'LiveUAMap',
  'ria': 'RIA (RU)',
  'pravdaua': 'Pravda (UA)',
  'nv': 'NV (UA)',
  'unian': 'UNIAN (UA)',
  'espreso': 'Espreso (UA)',
  'interfaxua': 'Interfax UA',
  '24tvua': '24TV (UA)',
  'liga': 'Liga (UA)',
  'meduza': 'Meduza',
  'ntv': 'NTV (RU)',
  'ng': 'NG (RU)',
  'militarnyy': 'Militarnyy',
  'mz': 'MZ',
  'forbesua': 'Forbes UA',
  'kp': 'KP (RU)',
};

export default function UnifiedConflictEventsTab() {
  const [activeSubtab, setActiveSubtab] = useState<ConflictSubtab>('acled');

  // ACLED filters
  const [acledSelectedTypes, setAcledSelectedTypes] = useState<Set<ACLEDEventType>>(
    new Set(ACLED_EVENT_TYPES)
  );

  // VIINA filters (by source)
  const [viinaSelectedSources, setViinaSelectedSources] = useState<Set<ViinaSource>>(
    new Set(VIINA_SOURCES)
  );

  // Handle URL hash for deep linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash.startsWith('conflict-')) {
        const subtab = hash.substring(9) as ConflictSubtab;
        const validSubtabs: ConflictSubtab[] = ['acled', 'ucdp', 'viina', 'bellingcat', 'comparison'];
        if (validSubtabs.includes(subtab)) {
          setActiveSubtab(subtab);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSubtabChange = (subtab: ConflictSubtab) => {
    setActiveSubtab(subtab);
    const newHash = `#conflict-${subtab}`;
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, '', newHash);
    }
  };

  // ACLED filter handlers
  const handleAcledToggle = (type: ACLEDEventType) => {
    setAcledSelectedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };
  const handleAcledSelectAll = () => setAcledSelectedTypes(new Set(ACLED_EVENT_TYPES));
  const handleAcledClearAll = () => setAcledSelectedTypes(new Set());

  // VIINA filter handlers
  const handleViinaToggle = (source: ViinaSource) => {
    setViinaSelectedSources(prev => {
      const next = new Set(prev);
      if (next.has(source)) next.delete(source);
      else next.add(source);
      return next;
    });
  };
  const handleViinaSelectAll = () => setViinaSelectedSources(new Set(VIINA_SOURCES));
  const handleViinaClearAll = () => setViinaSelectedSources(new Set());

  // Render sidebar based on active subtab
  const renderSidebar = () => {
    switch (activeSubtab) {
      case 'acled':
        return (
          <div className="conflict-sidebar">
            <div className="sidebar-section">
              <div className="sidebar-header">
                <h3>Event Types</h3>
                <div className="sidebar-actions">
                  <button onClick={handleAcledSelectAll} disabled={acledSelectedTypes.size === ACLED_EVENT_TYPES.length}>All</button>
                  <button onClick={handleAcledClearAll} disabled={acledSelectedTypes.size === 0}>None</button>
                </div>
              </div>
              <div className="filter-list">
                {ACLED_EVENT_TYPES.map(type => (
                  <label key={type} className="filter-item">
                    <input
                      type="checkbox"
                      checked={acledSelectedTypes.has(type)}
                      onChange={() => handleAcledToggle(type)}
                    />
                    <span className="filter-label">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'viina':
        return (
          <div className="conflict-sidebar">
            <div className="sidebar-section">
              <div className="sidebar-header">
                <h3>News Sources</h3>
                <div className="sidebar-actions">
                  <button onClick={handleViinaSelectAll} disabled={viinaSelectedSources.size === VIINA_SOURCES.length}>All</button>
                  <button onClick={handleViinaClearAll} disabled={viinaSelectedSources.size === 0}>None</button>
                </div>
              </div>
              <div className="filter-list">
                {VIINA_SOURCES.map(source => (
                  <label key={source} className="filter-item">
                    <input
                      type="checkbox"
                      checked={viinaSelectedSources.has(source)}
                      onChange={() => handleViinaToggle(source)}
                    />
                    <span className="filter-label">{SOURCE_LABELS[source] || source}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'ucdp':
      case 'bellingcat':
        return (
          <div className="conflict-sidebar">
            <div className="sidebar-section">
              <p className="no-filters-msg">No filters available for this dataset.</p>
            </div>
          </div>
        );

      case 'comparison':
        return null; // Comparison has its own inline controls

      default:
        return null;
    }
  };

  const hasSidebar = activeSubtab !== 'comparison';

  return (
    <div className="unified-conflict-tab">
      <SubtabNavigation
        activeSubtab={activeSubtab}
        onSubtabChange={handleSubtabChange}
      />
      <div className={`conflict-layout ${hasSidebar ? 'with-sidebar' : ''}`}>
        {hasSidebar && renderSidebar()}
        <div className="subtab-content">
          {activeSubtab === 'acled' && (
            <ACLEDSubtab selectedTypes={acledSelectedTypes} />
          )}
          {activeSubtab === 'ucdp' && <UCDPSubtab />}
          {activeSubtab === 'viina' && (
            <VIINASubtab selectedSources={viinaSelectedSources} />
          )}
          {activeSubtab === 'bellingcat' && <BellingcatSubtab />}
          {activeSubtab === 'comparison' && <ComparisonSubtab />}
        </div>
      </div>
    </div>
  );
}
