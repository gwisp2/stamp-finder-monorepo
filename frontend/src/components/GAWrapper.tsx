import { useEffect } from 'react';
import ReactGA from 'react-ga';
import { useLocation } from 'react-router-dom';

export const GAWrapper: React.FC<{ tag?: string }> = (props) => {
  const location = useLocation();

  // Initialize GA
  useEffect(() => {
    if (props.tag) {
      ReactGA.initialize(props.tag);
    }
  }, [props.tag]);

  // Send pageview event on location change
  useEffect(() => {
    if (props.tag) {
      ReactGA.pageview(location.pathname + location.search);
    }
  }, [props.tag, location.search]);

  return <>{props.children}</>;
};
