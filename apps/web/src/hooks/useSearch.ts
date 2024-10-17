import { useEffect, useState } from 'react';

import type { ConditionalKeys } from 'type-fest';

export function useSearch<T extends { [key: string]: any }, K extends ConditionalKeys<T, string>>(data: T[], key: K) {
  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setFilteredData(data.filter((item) => (item[key] as string).toLowerCase().includes(searchTerm.toLowerCase())));
  }, [data, searchTerm]);

  return {
    filteredData,
    searchTerm,
    setSearchTerm
  };
}
