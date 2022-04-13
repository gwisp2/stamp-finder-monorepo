import { Alert } from 'react-bootstrap';
import { ApiError } from 'service/AppApi';

export const ApiErrorAlert: React.VFC<{ error: unknown }> = (props) => {
  const error = props.error;
  let message = 'Неизвестная ошибка';
  if (error instanceof ApiError) {
    message = error.message;
  }
  return <Alert variant="danger">{message}</Alert>;
};
