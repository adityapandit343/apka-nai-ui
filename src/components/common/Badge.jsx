export default function Badge({ children, color = 'gold' }) {
  const colors = {
    gold: 'bg-gold-light/30 text-gold-dark border-gold-light',
    green: 'bg-green-100 text-green-800 border-green-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    gray: 'bg-smoke text-muted border-gray-200',
  };
  return (
    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${colors[color]}`}>
      {children}
    </span>
  );
}