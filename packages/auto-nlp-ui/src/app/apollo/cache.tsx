import { InMemoryCache, makeVar, Reference } from '@apollo/client';

export const cache: InMemoryCache = new InMemoryCache({
  typePolicies: {
    Run: {
      keyFields: ['runId'],
    },
    Metric: {
      keyFields: ['runId', 'name'],
    },
    MetricStep: {
      keyFields: false, //disabling normalization for metrics to improve performance
    },
  },
});
