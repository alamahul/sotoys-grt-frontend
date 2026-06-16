import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

/**
 * useSmartLoading
 * A reusable hook for handling data fetching with smart loading UI.
 *
 * @param fetcher - An async function that returns the desired data.
 * @returns { data, error, loading, showSkeleton }
 */
export default function useSmartLoading<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [loading, setLoading] = useState(true);

  // Timers refs to allow cleanup
  const skeletonTimer = useRef<NodeJS.Timeout | null>(null);
  const minSkeletonTimer = useRef<NodeJS.Timeout | null>(null);
  const swalTimer = useRef<NodeJS.Timeout | null>(null);
  // Track if this hook's own loading Swal is currently shown
  const ownSwalOpen = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const start = Date.now();

    // 200ms: potentially show skeleton
    skeletonTimer.current = setTimeout(() => {
      if (isMounted && loading) {
        setShowSkeleton(true);
        // Ensure skeleton stays at least 400ms total
        minSkeletonTimer.current = setTimeout(() => {}, 400);
      }
    }, 200);

    // 1500ms: show SweetAlert loading modal
    swalTimer.current = setTimeout(() => {
      if (isMounted && loading) {
        ownSwalOpen.current = true;
        Swal.fire({
          title: 'Memuat Data',
          text: 'Mohon tunggu sebentar...',
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
      }
    }, 1500);

    const closeSwalIfOwn = () => {
      if (ownSwalOpen.current && Swal.isVisible()) {
        Swal.close();
        ownSwalOpen.current = false;
      }
    };

    // Execute the async fetcher
    fetcher()
      .then((result) => {
        if (!isMounted) return;
        const elapsed = Date.now() - start;
        const finalize = () => {
          setData(result);
          setLoading(false);
          setShowSkeleton(false);
          // Only close Swal if it was opened by this hook
          closeSwalIfOwn();
        };
        // Cases handling timing
        if (elapsed < 200) {
          // Fast response, render immediately, no UI shown.
          finalize();
        } else if (elapsed < 1500) {
          // Show skeleton, ensure min 400ms
          const remaining = Math.max(0, 400 - (Date.now() - start - 200));
          setTimeout(finalize, remaining);
        } else {
          // Slow response: already showing Swal, just finalize.
          finalize();
        }
      })
      .catch((err: Error) => {
        if (!isMounted) return;
        // Close any loading UI opened by this hook
        closeSwalIfOwn();
        setError(err);
        setLoading(false);
        setShowSkeleton(false);
        // Show error alert
        Swal.fire({
          icon: 'error',
          title: 'Terjadi Kesalahan',
          text: err.message
        });
      });

    return () => {
      isMounted = false;
      if (skeletonTimer.current) clearTimeout(skeletonTimer.current);
      if (minSkeletonTimer.current) clearTimeout(minSkeletonTimer.current);
      if (swalTimer.current) clearTimeout(swalTimer.current);
    };
  }, [fetcher]);

  return { data, error, loading, showSkeleton };
}

