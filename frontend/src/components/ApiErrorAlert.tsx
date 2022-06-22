import { Alert } from 'react-bootstrap';
import { formatError } from 'state/errors';

export const ApiErrorAlert: React.VFC<{ error: unknown }> = (props) => {
  return <Alert variant="danger">{formatError(props.error)}</Alert>;
};
