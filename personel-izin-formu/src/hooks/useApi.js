import { useCallback, useEffect, useRef, useState } from 'react';
import { request } from '../api/client';

/**
 * Runs a GraphQL query when the component mounts and whenever `variables`
 * change. Returns { data, error, loading, reload }.
 */
export function useQuery(query, variables) {
  const key = JSON.stringify(variables || {});
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const latest = useRef(0);

  const load = useCallback(async () => {
    const id = ++latest.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await request(query, JSON.parse(key));
      if (id === latest.current) setState({ data, error: null, loading: false });
    } catch (error) {
      if (id === latest.current) setState((s) => ({ ...s, error, loading: false }));
    }
  }, [query, key]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}

/** Wraps a mutation: returns [run, { loading, error }]. `run` rethrows. */
export function useMutation(mutation) {
  const [state, setState] = useState({ loading: false, error: null });
  const run = useCallback(async (variables) => {
    setState({ loading: true, error: null });
    try {
      const data = await request(mutation, variables);
      setState({ loading: false, error: null });
      return data;
    } catch (error) {
      setState({ loading: false, error });
      throw error;
    }
  }, [mutation]);
  return [run, state];
}
