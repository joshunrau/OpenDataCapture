import { $Summary } from '@opendatacapture/schemas/summary';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

type SummaryQueryParams = {
  groupId?: string;
};

export const summaryQueryOptions = ({ params }: { params?: SummaryQueryParams } = {}) => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get('/v1/summary', {
        params
      });
      return $Summary.parse(response.data);
    },
    queryKey: ['summary', params?.groupId]
  });
};

export const useSummaryQuery = ({ params }: { params?: SummaryQueryParams } = {}) => {
  return useSuspenseQuery(summaryQueryOptions({ params }));
};
