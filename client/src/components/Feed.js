import React from 'react';
import { Col, Container, Row, Table } from 'react-bootstrap';

import moment from 'moment';

import './Feed.scss';

function Feed({ items, setDownloaded }) {
  return (
    <Container>
      <Row>
        <Col className="mt-2">
          {items.length > 0 ? (
            <Table bordered hover>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Published At</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.guid} className={item.downloadedAt ? 'downloaded' : ''}>
                    <td>{item.title}</td>
                    <td>{moment(item.publishedAt).format('YYYY-MM-DD hh:mm:ss')}</td>
                    <td>
                      <a href={item.link} target="_blank" rel="noreferrer" onClick={(ev) => {
                        setDownloaded(item.guid);
                      }}>Download</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>
              No items found.
            </p>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Feed;
