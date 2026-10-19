import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { Input } from './Input';

export const SearchInput = ({ placeholder = 'Search...', onChange, className }) => {
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9"
      />
    </div>
  );
};
