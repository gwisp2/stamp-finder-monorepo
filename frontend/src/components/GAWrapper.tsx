import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { useLocation } from 'react-router-dom';
import { useDebounce } from 'use-debounce';

export const GAWrapper: React.FC<{ tag?: string }> = (props) => {
  const location = useLocation();

  // Initialize GA
  useEffect(() => {
    if (props.tag) {
      ReactGA.initialize(props.tag);
    }
  }, [props.tag]);

  // Send pageview event on location change
  const [debouncedLocationSearch] = useDebounce(location.search, 2000);
  useEffect(() => {
    if (props.tag) {
      ReactGA.pageview(location.pathname + location.search);
    }
  }, [props.tag, debouncedLocationSearch]);

  return <>{props.children}</>;
};
