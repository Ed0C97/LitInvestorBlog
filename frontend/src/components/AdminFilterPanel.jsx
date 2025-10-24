import React from 'react';
import { Filter } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

/**
 * Un pannello filtri orizzontale e pulito, specifico per la Admin Dashboard.
 *
 * @param {string} title - Il titolo del pannello filtri.
 * @param {React.ReactNode} children - I controlli del filtro (Input, Select, etc.).
 * @param {React.ReactNode} [actions] - Elementi di azione da mostrare a destra (es. bottoni).
 * @param {string} [className] - Classi CSS aggiuntive.
 */
const AdminFilterPanel = ({ title, children, actions, className }) => {
  return (
    <div
      className={twMerge(
        "bg-white rounded-lg py-4 mb-6",
        className
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Sezione Sinistra: Titolo e Filtri */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          {title && (
            <h3 className="text-base font-semibold text-dark flex items-center gap-2 flex-shrink-0">
              <Filter className="w-4 h-4 text-gray" />
              <span>{title}</span>
            </h3>
          )}

          {/* Contenitore per i controlli di filtro */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {children}
          </div>
        </div>

        {/* Sezione Destra: Azioni */}
        {actions && (
          <div className="flex items-center gap-2 justify-end flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFilterPanel;