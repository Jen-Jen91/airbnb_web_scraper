import puppeteer from "puppeteer"

type PropertyDetails = {
    name: string
    type: string
    numberOfBedrooms: number | string
    numberOfBathrooms: number | string
}

async function scrapeWebsite(url: string) {
    const browser = await puppeteer.launch({ headless: true, ignoreDefaultArgs: ['--disable-extensions'] })

    try {
        const page = await browser.newPage()
        await page.goto(url)

        const propertyDetails: PropertyDetails = await page.evaluate(() => {
            const missingMessage = "cannot be found"

            const propertyName = document.querySelector("h1")?.textContent?.trim()
            const propertyType = document.querySelector("h2")?.textContent?.trim()

            const propertyDetailsList = 'div[data-section-id="OVERVIEW_DEFAULT_V2"] div div section div:nth-child(2) ol'
            const bedroomsText = document.querySelector(`${propertyDetailsList} li:nth-child(2)`)?.textContent?.trim()
            const bathroomsText = document.querySelector(`${propertyDetailsList} li:nth-child(4)`)?.textContent?.trim()

            const numberOfBedrooms = bedroomsText ? Number(bedroomsText.split(" ")[1]) : `Number of bedrooms ${missingMessage}`
            const numberOfBathrooms = bathroomsText ? Number(bathroomsText.split(" ")[1]) : `Number of bathrooms ${missingMessage}`

            return {
                name: propertyName || `Property name ${missingMessage}`,
                type: propertyType || `Property type ${missingMessage}`,
                numberOfBedrooms,
                numberOfBathrooms
            }
        })

        console.log("Property details: ", propertyDetails)
    } catch (error) {
        console.error(error)
    } finally {
        console.log("Closing browser...")
        await browser.close()
    }
}

scrapeWebsite('https://www.airbnb.co.uk/rooms/33571268') // Page cannot be found
// scrapeWebsite('https://www.airbnb.co.uk/rooms/20669368') // Little Country Houses - Poppy's Pad with hot tub
// scrapeWebsite('https://www.airbnb.co.uk/rooms/50633275') // Lovely loft on the beautiful North Norfolk Coast