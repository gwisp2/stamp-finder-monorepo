declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SF_GA_TAG: string;
      SF_GITHUB_LINK: string;
      SF_SHOPS_DATA_URL: string;
      SF_STAMPS_DATA_URL: string;
    }
  }
}

export {};
