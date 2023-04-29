import plural from 'plural-ru';
import React from 'react';
import { Form } from 'react-bootstrap';

export const AmountFoundMessage: React.FC<{ amount: number }> = React.memo((props) => {
  return (
    <Form.Text>
      По запросу {plural(props.amount, 'найдена', 'найдено', 'найдено')} {props.amount}{' '}
      {plural(props.amount, 'марка', 'марки', 'марок')}.
    </Form.Text>
  );
});
AmountFoundMessage.displayName = 'AmountFoundMessage';
