"use client";

export function MobileModuleSelect({ modules, value, onChange }: {
  modules: readonly { id: string; name: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return <label className="dance-mobile-module">
    <span>Sección del panel</span>
    <select value={value} onChange={event => onChange(event.target.value)}>
      {modules.map(module => <option key={module.id} value={module.id}>{module.name}</option>)}
    </select>
  </label>;
}
