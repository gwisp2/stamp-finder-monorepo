import { Alert } from 'react-bootstrap';

export const ApiErrorAlert: React.FC<{ error: unknown }> = (props) => {
  const errMessage = props.error instanceof Error ? props.error.message : String(props.error);
  return (
    <Alert variant="danger">
      <pre>{errMessage}</pre>
    </Alert>
  );
};
