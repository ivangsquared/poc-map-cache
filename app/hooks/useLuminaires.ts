import { useState, useCallback, useEffect } from "react";
import { Luminaire, LuminairesResponse } from "../types/luminaire";

interface UseLuminairesOptions {
  initialData?: Luminaire[];
  autoFetch?: boolean;
  pageSize?: number;
}

export function useLuminaires({
  initialData = [],
  autoFetch = true,
  pageSize = 100,
}: UseLuminairesOptions = {}) {
  const [data, setData] = useState<Luminaire[]>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);

  const fetchLuminaires = useCallback(
    async (pageNumber: number = 1, append: boolean = false) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/luminaires?page=${pageNumber}&pageSize=${pageSize}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: LuminairesResponse = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        setData((prevData) =>
          append ? [...prevData, ...(result.data || [])] : result.data || []
        );

        if (result.meta) {
          setTotal(result.meta.total);
          setHasMore(
            pageNumber * pageSize <
              (result.meta.total || result.data?.length || 0)
          );
        } else {
          setHasMore(false);
        }

        setPage(pageNumber);
      } catch (err) {
        console.error("Error fetching luminaires:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch luminaires")
        );
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  const fetchNextPage = useCallback(() => {
    if (!loading && hasMore) {
      fetchLuminaires(page + 1, true);
    }
  }, [loading, hasMore, page, fetchLuminaires]);

  const refresh = useCallback(() => {
    fetchLuminaires(1, false);
  }, [fetchLuminaires]);

  useEffect(() => {
    if (autoFetch) {
      fetchLuminaires(1, false);
    }
  }, [autoFetch, fetchLuminaires]);

  return {
    data,
    loading,
    error,
    page,
    hasMore,
    total,
    fetchNextPage,
    refresh,
    setData,
  };
}

export default useLuminaires;
