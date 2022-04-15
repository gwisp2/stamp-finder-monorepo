import { AppWrapper } from 'AppWrapper';
import fs from 'fs';
import path from 'path';
import React from 'react';
import { SSRProvider } from 'react-bootstrap';
import { renderToString } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from 'react-query';
import { StaticRouter } from 'react-router-dom/server';
import { AppApi, DataPath } from 'service/AppApi';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const insertAfter = (content: string, anchor: string, insert: string): string => {
  if (!content.includes(anchor)) {
    throw new Error(`No ${anchor} found`);
  }
  return content.replace(anchor, anchor + insert);
};

const insertBefore = (content: string, anchor: string, insert: string): string => {
  if (!content.includes(anchor)) {
    throw new Error(`No ${anchor} found`);
  }
  return content.replace(anchor, insert + anchor);
};

const main = (): number => {
  const parsedCommand = yargs(hideBin(process.argv))
    .options({
      db: {
        demandOption: true,
        type: 'string',
        description: 'Path to stamps database with stamps.json and shops.json',
      },
      template: {
        demandOption: true,
        type: 'string',
        description: 'Path to usual client-side-rendered html',
      },
      out: {
        demandOption: true,
        type: 'string',
        description: 'Path to html file to generate',
      },
    })
    .parseSync();

  const template = fs.readFileSync(parsedCommand.template, 'utf8');
  const stampsJson = JSON.parse(fs.readFileSync(path.join(parsedCommand.db, 'stamps.json'), 'utf8'));
  const shopsJson = JSON.parse(fs.readFileSync(path.join(parsedCommand.db, 'shops.json'), 'utf8'));

  const queryClient = new QueryClient();
  const api = AppApi.create();
  DataPath.Shops.parseAndSetData(api, queryClient, shopsJson);
  DataPath.Stamps.parseAndSetData(api, queryClient, stampsJson);

  const sheet = new ServerStyleSheet();
  let rendered_app: string;
  let rendered_styles: string;
  try {
    rendered_app = renderToString(
      <React.StrictMode>
        <SSRProvider>
          <StyleSheetManager sheet={sheet.instance}>
            <StaticRouter location="/">
              <QueryClientProvider client={queryClient}>
                <AppWrapper api={api} />
              </QueryClientProvider>
            </StaticRouter>
          </StyleSheetManager>
        </SSRProvider>
      </React.StrictMode>,
    );
    rendered_styles = sheet.getStyleTags();
  } catch (error) {
    console.error(error);
    return 1;
  } finally {
    sheet.seal();
  }

  const i1 = insertBefore(template, '</head>', rendered_styles);
  const i2 = insertAfter(i1, '<div id="root">', rendered_app);
  fs.writeFileSync(parsedCommand.out, i2, 'utf8');
  return 0;
};

process.exit(main());
