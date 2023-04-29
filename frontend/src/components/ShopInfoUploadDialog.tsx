import { useStampApi } from 'api/StampApi';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useAsync } from 'react-use';
import { ApiErrorAlert } from './ApiErrorAlert';

export const ShopInfoUploadDialog: React.FC<{ show: boolean; onUpload?: () => void; onHide?: () => void }> = React.memo(
  (props) => {
    const stampApi = useStampApi();
    const [file, setFile] = React.useState<File | undefined>(undefined);
    const [uploadPromise, setUploadPromise] = useState<Promise<void> | null>(null);
    const uploadAsync = useAsync(() => uploadPromise ?? Promise.resolve(), [uploadPromise]);

    useEffect(() => {
      // Reset on showing or hiding
      setFile(undefined);
      setUploadPromise(null);
    }, [props.show]);

    return (
      <Modal show={props.show} onHide={props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Обновить список доступных марок</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
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
            {uploadPromise && uploadAsync.value && (
              <Alert variant="success">Данные обновлены. Перезагрузите страницу.</Alert>
            )}
            {uploadAsync.error && <ApiErrorAlert error={uploadAsync.error} />}
          </>
        </Modal.Body>
        {
          <Modal.Footer>
            {uploadAsync.loading && <Spinner animation="border" />}
            <Button
              variant="primary"
              onClick={() => {
                if (file !== undefined) {
                  setUploadPromise(stampApi.uploadShopDataFile(file));
                }
              }}
              disabled={file === undefined || uploadAsync.loading}
            >
              Загрузить
            </Button>
          </Modal.Footer>
        }
      </Modal>
    );
  },
);
ShopInfoUploadDialog.displayName = 'ShopInfoUploadDialog';
