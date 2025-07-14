import { $SetupState } from '@opendatacapture/schemas/setup';
import { queryOptions, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const setupStateQueryOptions = () => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get('/v1/setup');
      return $SetupState.parseAsync(response.data);
    },
    queryKey: ['setup-state']
  });
};

export function useSetupState() {
  return useQuery(setupStateQueryOptions());
}
