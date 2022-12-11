import React, { useState, useEffect } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { XMLParser } from 'fast-xml-parser';
import moment from 'moment';

import Feed from './components/Feed';
import Navbar from './components/Navbar';
import './App.scss';

const GET_ITEMS = gql`
query GetItems {
  items(order_by: {publishedAt: desc}) {
    guid
    title
    link
    publishedAt
    downloadedAt
  }
}
`;

const SET_ITEM_DOWNLOADED = gql`
mutation SetItemDownloaded($guid: String!, $downloadedAt: timestamptz) {
  update_items_by_pk(pk_columns: {guid: $guid}, _set: {downloadedAt: $downloadedAt}) {
    guid
  }
}
`;

const ADD_ITEMS = gql`
mutation AddItems($objects: [items_insert_input!]!) {
  insert_items(objects: $objects) {
    returning {
      guid
      title
      link
      publishedAt
      syncedAt
      downloadedAt
    }
  }
}
`;

const REFRESH_DURATION_SECS = 300;

function App() {
  const [lastSyncedAt, setLastSyncedAt] = useState(new Date());
  const [syncing, setSyncing] = useState(false);
  const [items, setItems] = useState([]);
  const [timer, setTimer] = useState(null);
  const [setItemDownloaded] = useMutation(SET_ITEM_DOWNLOADED);
  const [addItems] = useMutation(ADD_ITEMS, {
    onCompleted: (data) => {
      const newItems = data.insert_items.returning;
      setItems([...newItems, ...items]);
    }
  });

  const fetchAndSyncRssFeed = async () => {
    if (timer) {
      clearTimeout(timer);
    }
    const url = 'https://rarbg.to/rssdd.php?category=2;18;41;49';
    const feedUrl = 'http://localhost:3001/feed?url=' + encodeURIComponent(url);
    setSyncing(true);
    const response = await fetch(feedUrl);
    const rssData = await response.text();
    const xml = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: '$text'
    });
    const result = xml.parse(rssData);
    let channel = result.rss && result.rss.channel ? result.rss.channel : result.feed;
    if (Array.isArray(channel)) {
      channel = channel[0];
    }
    let rssItems = channel.item || channel.entry || [];
    if (rssItems && ! Array.isArray(rssItems)) {
      rssItems = [rssItems];
    }
    const existingItemGuids = {};
    items.forEach((item) => {
      existingItemGuids[item.guid] = true;
    });

    const unsyncedItems = rssItems.filter((item) => ! (item.guid in existingItemGuids)).map((item) => ({
      guid: item.guid,
      title: item.title,
      link: item.link,
      publishedAt: moment(item.pubDate).toDate()
    }));

    if (unsyncedItems.length > 0) {
      addItems({ variables: { objects: unsyncedItems } });
    }

    setLastSyncedAt(new Date());
    setSyncing(false);
    setTimer(setTimeout(fetchAndSyncRssFeed, REFRESH_DURATION_SECS * 1000));
  };

  useQuery(GET_ITEMS, {
    onCompleted: (data) => {
      setItems(data.items);
    }
  });

  useEffect(() => {
    // delay a few seconds to prevent race condition with fetching existing items
    setTimeout(fetchAndSyncRssFeed, 3000);
  }, []);

  return (
    <>
      <Navbar lastSyncedAt={lastSyncedAt} syncing={syncing} fetchAndSyncRssFeed={fetchAndSyncRssFeed} />
      <Feed items={items} setDownloaded={(guid) => {
        const downloadedAt = new Date();
        setItemDownloaded({ variables: { guid, downloadedAt } });
        setItems(items.map((item) => {
          if (item.guid === guid) {
            return {
              ...item,
              downloadedAt
            };
          }

          return item;
        }));
      }} />
    </>
  );
}

export default App;
