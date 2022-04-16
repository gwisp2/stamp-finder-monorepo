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
import watch from 'watch';
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

interface GenerateOptions {
  templatePath: string;
  dbPath: string;
  outPath: string;
}

const generate = (options: GenerateOptions) => {
  try {
    const template = fs.readFileSync(options.templatePath, 'utf8');
    const stampsJson = JSON.parse(fs.readFileSync(path.join(options.dbPath, 'stamps.json'), 'utf8'));
    const shopsJson = JSON.parse(fs.readFileSync(path.join(options.dbPath, 'shops.json'), 'utf8'));

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
    } finally {
      sheet.seal();
    }

    const i1 = insertBefore(template, '</head>', rendered_styles);
    const i2 = insertAfter(i1, '<div id="root">', rendered_app);
    fs.writeFileSync(options.outPath, i2, 'utf8');
    console.log('Generated');
  } catch (error) {
    console.log(error);
    return 1;
  }
  return 0;
};

const watchForDbChanges = (root: string, handler: () => void) => {
  const interestingFiles = [path.join(root, 'stamps.json'), path.join(root, 'shops.json')];
  watch.createMonitor(root, (monitor) => {
    monitor.on('created', function (f) {
      if (interestingFiles.includes(f)) {
        handler();
      }
    });
    monitor.on('changed', function (f) {
      if (interestingFiles.includes(f)) {
        handler();
      }
    });
  });
};

const main = () => {
  const args = yargs(hideBin(process.argv))
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
      watch: {
        demandOption: false,
        type: 'boolean',
        description: 'whether to watch for changes in stamps database and generate new page on changes',
      },
      delay: {
        demandOption: false,
        type: 'number',
        description: 'whether to watch for changes in stamps database and generate new page on changes',
      },
    })
    .parseSync();

  const options: GenerateOptions = {
    dbPath: args.db,
    templatePath: args.template,
    outPath: args.out,
  };

  if (args.watch) {
    generate(options);
    console.log('Watching...');
    let rev = 0;
    watchForDbChanges(options.dbPath, () => {
      const savedRev = ++rev;
      setTimeout(() => {
        if (savedRev === rev) {
          generate(options);
        }
      }, args.delay ?? 1000);
    });
  } else {
    process.exit(generate(options));
  }
};

main();
