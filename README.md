# Airbnb Web Scraper

This project is intended to scrape basic property details from an Airbnb website and output them as a CSV file, using Puppeteer and Fast-CSV.

The `scrapeWebsite` function is called with a url and Puppeteer renders the website on an instance of the Chrome broswer. If this succeeds, it crawls through the page to close the initial cookies banner (if applicable), and open the amenities modal (if applicable). By accessing the DOM structure, it then scrapes the relevant property details using specific `querySelectors`. These details are then converted into an object for the CSV parser which outputs them as columns and rows in a local CSV file.

### To run the web scraper:

- Run `npm install`
- On the `webScraper.ts` file, un-comment a `scrapeWebsite` call with the url you wish to use
  - It's best to only run one call at a time, otherwise the generated CSV file will be overwitten each time
- Run `npm run start`

#### Possible issues with M1 Macs:

There have been some issues with installing / running Puppeteer on M1 Macs, so you may need to provide your own `executablePath` option to `puppeteer.launch()` which points to your own Chrome installation. The below links have more details but let me know if you have any issues:

- https://github.com/puppeteer/puppeteer/issues/6622
- https://stackoverflow.com/questions/74121253/unable-to-launch-puppeteer-on-local-mac-m1

### Possible ways to improve this project:

- Testing
  - I didn't have time for this project, but I would always want to implement a testing library which would check that this function works for a variety of different properties
  - It would also be good to check that the function catches all possible errors
- Improved selectors
  - Currently the selectors are quite specific for the two example websites and may not work for every Airbnb property page, so it would be good to tidy these up so they work more generally (e.g. if a page does not have many amenities, the "_Show all ... amenities_" button may not appear)
- Code abstraction
  - The `scrapeWebsite` function is already quite large, so it would be good to break this up and abstract as much code as possible into separate functions
  - It would also be nice to format the amenity list items so that they could be separated up into different sections with relevant sub-text when needed (e.g. `{ section: "Kitchen and dining", text: "Cooking basics", subText: "Pots and pans" }`)
- Scrape multiple URLs at the same time
  - Rather than needing multiple calls of `scrapeWebsite`, we could adjust the function to take an array of urls and make bulk queries
- Format the CSV file
  - We could improve the formatting so the amenities are listed on separate rows (rather than as a long string)
- URL security issues
  - Web security and anti-bot systems could block web scraping so it would be good to take this into account
- Alternative to Puppeteer
  - This library requires a Chrome browser only which might be an issue if we want to try it on other browsers
