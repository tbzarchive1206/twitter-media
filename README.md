# Twitter Media

A GitHub Pages archive of THE BOYZ Twitter media. The index is synchronized from Google Drive folder `1Wc7JGA7jKKOTY6ZH5xoQJVRArr2mNo_6` twice daily.

## First deployment

1. Create a GitHub repository named `twitter-media` and push this directory to its `main` branch.
2. In **Settings → Secrets and variables → Actions**, add `GOOGLE_DRIVE_API_KEY` (the Google Drive API key used by the Fromm archive).
3. In **Settings → Pages**, set the source to **GitHub Actions**.
4. Run **Sync Twitter Media** once from the Actions tab. It creates the initial media index; the following push triggers the Pages deployment.

The archive defaults to all accounts sorted newest-first. Users can combine account, year and member filters, or search a date (`YYMMDD`), English name, Korean name, account, or original file name. Display captions intentionally show only `YYMMDD`.
