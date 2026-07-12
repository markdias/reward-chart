import React from 'react';

export const SettingsBlock = ({ children, title }: { children: React.ReactNode, title?: string }) => (
  <div className="mb-6 w-full">
    {title && <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 px-4">{title}</h3>}
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
      {children}
    </div>
  </div>
);

export const SettingsRow = ({ 
  label, 
  value, 
  type = 'text', 
  isToggle = false, 
  isLast = false, 
  toggleActive = false,
  onChange,
  onToggle
}: {
  label: string;
  value?: string | number;
  type?: string;
  isToggle?: boolean;
  isLast?: boolean;
  toggleActive?: boolean;
  onChange?: (val: string) => void;
  onToggle?: () => void;
}) => (
  <div className={`flex items-center justify-between p-4 ${!isLast ? 'border-b border-stone-100' : ''} bg-white hover:bg-stone-50 transition-colors`}>
    <span className="text-sm font-bold text-stone-700">{label}</span>
    <div className="w-1/2 flex justify-end">
      {isToggle ? (
         <div 
           onClick={onToggle}
           className={`w-11 h-6 rounded-full transition-colors duration-300 ease-in-out shrink-0 cursor-pointer ${toggleActive ? 'bg-cyan-500' : 'bg-stone-200'}`}
         >
            <div className={`w-5 h-5 bg-white rounded-full mt-0.5 ml-0.5 transition-transform duration-300 shadow-sm ${toggleActive ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
      ) : (
        <input 
           type={type} 
           value={value} 
           onChange={(e) => onChange && onChange(e.target.value)}
           className="w-full text-right bg-transparent text-stone-500 font-semibold focus:outline-none focus:text-stone-900 transition-colors"
        />
      )}
    </div>
  </div>
);

export const SettingsSelectRow = ({ 
  label, 
  options, 
  value, 
  isLast = false,
  onChange
}: {
  label: string;
  options: { label: string, value: string }[];
  value?: string;
  isLast?: boolean;
  onChange?: (val: string) => void;
}) => (
  <div className={`flex items-center justify-between p-4 ${!isLast ? 'border-b border-stone-100' : ''} bg-white hover:bg-stone-50 transition-colors`}>
    <span className="text-sm font-bold text-stone-700">{label}</span>
    <select 
      value={value} 
      onChange={(e) => onChange && onChange(e.target.value)}
      className="text-right bg-transparent text-stone-500 font-semibold focus:outline-none appearance-none cursor-pointer pr-4" 
      style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a8a29e%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '8px auto' }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

export const SettingsActionRow = ({ 
  label, 
  icon: Icon, 
  onClick,
  isLast = false,
  danger = false
}: {
  label: string;
  icon?: any;
  onClick: () => void;
  isLast?: boolean;
  danger?: boolean;
}) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 ${!isLast ? 'border-b border-stone-100' : ''} bg-white hover:bg-stone-50 transition-colors cursor-pointer text-left`}
  >
    <span className={`text-sm font-bold ${danger ? 'text-rose-600' : 'text-stone-700'}`}>{label}</span>
    {Icon && <Icon className={`w-5 h-5 ${danger ? 'text-rose-500' : 'text-stone-400'}`} />}
  </button>
);
