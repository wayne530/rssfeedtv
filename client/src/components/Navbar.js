import React from 'react';
import { Button, Container, Navbar as BootstrapNavbar, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

function Navbar({ lastSyncedAt, syncing, fetchAndSyncRssFeed }) {
  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="sm" sticky="top">
    <Container>
        <BootstrapNavbar.Brand>RSSFeedTV</BootstrapNavbar.Brand>
        <BootstrapNavbar.Text className="justify-content-end">
        {syncing ? (
            <span>
            <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
            {' '}
            Syncing…
            </span>
        ) : (
            <span className="d-flex align-items-center">
                {lastSyncedAt ? `Last synced: ${moment(lastSyncedAt).format('YYYY-MM-DD hh:mm:ss')}` : 'Not synced yet'}
                <Button as="a" onClick={(ev) => {
                  ev.preventDefault();
                  fetchAndSyncRssFeed();
                }} variant="link" className="pt-0 pb-0 fs-6 lh-1" title="Sync Now">
                <FontAwesomeIcon icon={faRotateRight} />
                </Button>
            </span>
        )}
        </BootstrapNavbar.Text>
    </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
