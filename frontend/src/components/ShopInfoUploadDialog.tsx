import React, { useEffect } from 'react';
import { Form, Modal } from 'react-bootstrap';

export const ShopInfoUploadDialog: React.VFC<{ show: boolean; onUpload?: () => void; onHide?: () => void }> =
  React.memo((props) => {
    const [file, setFile] = React.useState<File | undefined>(undefined);
    // const mutation = useShopUpload();

    useEffect(() => {
      // Reset on showing or hiding
      setFile(undefined);
    }, [props.show]);

    // useEffect(() => {
    //   if (mutation.isSuccess && props.onHide !== undefined) {
    //     props.onHide();
    //   }
    // }, [mutation.isSuccess]);

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

          {/* {mutation.isError && <ApiErrorAlert error={mutation.error} />} */}
        </Modal.Body>

        {/* <Modal.Footer>
        {mutation.isLoading && <Spinner animation="border" />}
        <Button
          variant="primary"
          onClick={() => {
            if (file !== undefined) {
              mutation.mutate(file);
            }
          }}
          disabled={file === undefined || mutation.isLoading}
        >
          Загрузить
        </Button>
      </Modal.Footer> */}
      </Modal>
    );
  });
ShopInfoUploadDialog.displayName = 'ShopInfoUploadDialog';
