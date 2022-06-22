import React, { useEffect } from 'react';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useUpdateShopsMutation } from 'state/api.slice';
import { ApiErrorAlert } from './ApiErrorAlert';

export const ShopInfoUploadDialog: React.VFC<{ show: boolean; onUpload?: () => void; onHide?: () => void }> =
  React.memo((props) => {
    const [file, setFile] = React.useState<File | undefined>(undefined);
    const [uploadFile, mutation] = useUpdateShopsMutation();

    useEffect(() => {
      // Reset on showing or hiding
      setFile(undefined);
      mutation.reset();
    }, [props.show]);

    return (
      <Modal show={props.show} onHide={props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Обновить список доступных марок</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>
            Некоторые филиалы салона Коллекционер по запросу присылают xls-файл с остатками. Вы можете его загрузить,
            обновив информацию на этом сайте для всех пользователей.
          </p>

          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>xls-файл с остатками</Form.Label>
            <Form.Control
              name="file"
              type="file"
              accept=".xls"
              onChange={(e) => setFile((e.target as unknown as { files: File[] }).files[0])}
            />
          </Form.Group>
          {mutation.isSuccess && <Alert variant="success">Данные обновлены</Alert>}
          {mutation.isError && <ApiErrorAlert error={mutation.error} />}
        </Modal.Body>
        {
          <Modal.Footer>
            {mutation.isLoading && <Spinner animation="border" />}
            <Button
              variant="primary"
              onClick={() => {
                if (file !== undefined) {
                  uploadFile(file);
                }
              }}
              disabled={file === undefined || mutation.isLoading}
            >
              Загрузить
            </Button>
          </Modal.Footer>
        }
      </Modal>
    );
  });
ShopInfoUploadDialog.displayName = 'ShopInfoUploadDialog';
