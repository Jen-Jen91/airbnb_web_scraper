import puppeteer from "puppeteer"
import { writeToPath } from "@fast-csv/format"

type Amenities = {
    available: string[],
    notIncluded: string[]
}

type PropertyDetails = {
    name: string
    type: string
    numberOfBedrooms: number | string
    numberOfBathrooms: number | string
    amenities: Amenities
}

type CsvPropertyDetails = {
    PropertyName: string
    PropertyType: string
    NumberOfBedrooms: number | string
    NumberOfBathrooms: number | string
    AvailableAmenities: string[]
    UnavailableAmenities: string[]
}

const TIMEOUT = { timeout: 2000 }

async function scrapeWebsite(url: string) {
    const browser = await puppeteer.launch({ headless: true, ignoreDefaultArgs: ['--disable-extensions'] })

    try {
        const page = await browser.newPage()
        await page.goto(url)

        // Close cookies banner
        await page.waitForSelector('footer button', TIMEOUT)
            .catch((e) => console.error(e))
        await page.click('footer button')
            .catch((e) => console.error(e))

        // Open amenities modal
        await page.waitForSelector('div[data-section-id="AMENITIES_DEFAULT"] button', TIMEOUT)
            .catch((e) => console.error(e))
        await page.click('div[data-section-id="AMENITIES_DEFAULT"] button')
            .catch((e) => console.error(e))

        // Wait for amenities modal to appear
        await page.waitForSelector('div[aria-label="What this place offers"]', TIMEOUT)
            .catch((e) => console.error(e))

        const propertyDetails: PropertyDetails = await page.evaluate(() => {
            const missingMessage = "cannot be found"

            const propertyName = document.querySelector("h1")?.textContent?.trim()
            const name = !propertyName || propertyName.includes("Oops") ? `Property name ${missingMessage}` : propertyName

            const propertyType = document.querySelector("h2")?.textContent?.trim()
            const type = !propertyType || propertyType.includes("We can't seem to find") ? `Property type ${missingMessage}` : propertyType

            const propertyDetailsList = 'div[data-section-id="OVERVIEW_DEFAULT_V2"] ol'

            const bedroomsText = document.querySelector(`${propertyDetailsList} li:nth-child(2)`)?.textContent?.trim()
            const numberOfBedrooms = bedroomsText ? Number(bedroomsText.split(" ")[1]) : `Number of bedrooms ${missingMessage}`

            const bathroomsText = document.querySelector(`${propertyDetailsList} li:nth-child(4)`)?.textContent?.trim()
            const numberOfBathrooms = bathroomsText ? Number(bathroomsText.split(" ")[1]) : `Number of bathrooms ${missingMessage}`

            const amenities: Amenities = {
                available: [],
                notIncluded: []
            }

            const amenityListItems = document.querySelectorAll('div[aria-label="What this place offers"] li')

            amenityListItems?.forEach((listItem) => {
                const text = listItem?.textContent?.trim()
                if (!text) return
                if (text.includes("Unavailable")) {
                    amenities.notIncluded.push(text)
                } else {
                    amenities.available.push(text)
                }
            })

            return {
                name,
                type,
                numberOfBedrooms,
                numberOfBathrooms,
                amenities
            }
        })

        console.log("Property details: ", propertyDetails)

        // Convert the data and create a CSV file
        const csvPropertyDetails: Array<CsvPropertyDetails> = [{
            PropertyName: propertyDetails.name,
            PropertyType: propertyDetails.type,
            NumberOfBedrooms: propertyDetails.numberOfBedrooms,
            NumberOfBathrooms: propertyDetails.numberOfBathrooms,
            AvailableAmenities: propertyDetails.amenities.available,
            UnavailableAmenities: propertyDetails.amenities.notIncluded
        }]

        writeToPath("propertyDetails.csv", csvPropertyDetails, { headers: true })
            .on("error", error => console.error(error))

    } catch (error) {
        console.error(error)
    } finally {
        console.log("Closing browser...")
        await browser.close()
    }
}

// scrapeWebsite('broken_url') // Broken url - should error out
// scrapeWebsite('https://www.airbnb.co.uk/rooms/33571268') // Page cannot be found - should log errors for initial waitForSelector calls but still generate a local CSV file with empty data
// scrapeWebsite('https://www.airbnb.co.uk/rooms/20669368') // Little Country Houses - should generate a populated CSV file
scrapeWebsite('https://www.airbnb.co.uk/rooms/50633275') // Lovely loft on the beautiful North Norfolk Coast - should generate a populated CSV file