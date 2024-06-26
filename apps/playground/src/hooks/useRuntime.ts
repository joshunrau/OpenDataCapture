import { useEffect, useState } from 'react';

import axios from 'axios';
import { difference, mapKeys } from 'lodash-es';

type RuntimeManifest = {
  declarations: string[];
  sources: string[];
};

export function useRuntime(version: string) {
  const [declarations, setDeclarations] = useState<{ [key: string]: string }>({});
  const [manifest, setManifest] = useState<RuntimeManifest>({
    declarations: [],
    sources: []
  });

  const loadDeclaration = async (filename: string) => {
    const response = await axios.get<string>(`/runtime/${version}/${filename}`);
    setDeclarations((prevDeclarations) => ({ ...prevDeclarations, [filename]: response.data }));
  };

  useEffect(() => {
    axios
      .get<RuntimeManifest>(`/runtime/${version}/runtime.json`)
      .then((response) => setManifest(response.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    difference(manifest.declarations, Object.keys(declarations)).forEach((filename) => {
      void loadDeclaration(filename);
    });
  }, [manifest]);

  return {
    libs: mapKeys(declarations, (_, key) => `/runtime/${version}/${key}`)
  };
}
