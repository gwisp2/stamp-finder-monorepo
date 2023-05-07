package main

import (
	"fmt"
	mapset "github.com/deckarep/golang-set/v2"
	"github.com/jessevdk/go-flags"
	"log"
	"os"
	"path"
	"sf/internal/data"
	"sf/internal/rusmarka"
)

type CliOptions struct {
	ScrapeNewPages   bool `short:"n" long:"new" description:"scrape new pages"`
	ScrapeCategories bool `short:"c" long:"categories" description:"scrape categories for all stamps"`
	Positional       struct {
		StampsDataPath string `required:"yes"`
	} `positional-args:"yes"`
}

func main() {
	var options CliOptions
	remainingArgs, err := flags.Parse(&options)
	if err != nil {
		// go-flags prints error message
		os.Exit(1)
	}
	if len(remainingArgs) != 0 {
		_, _ = fmt.Fprintf(os.Stderr, "Unparsed args remaining: %s\n", remainingArgs)
		os.Exit(1)
	}
	stampsJsonPath := path.Join(options.Positional.StampsDataPath, "stamps.json")
	stampsJson, err := data.LoadStampsJsonFromFile(stampsJsonPath)
	if err != nil {
		log.Fatal(err)
	}

	addedNewStamps := false
	if options.ScrapeNewPages {
		// Find links to new pages
		knownPages := mapset.NewSet[string]()
		knownPages.Append(stampsJson.AllPages()...)
		urls, err := rusmarka.CollectStampPageUrls("https://rusmarka.ru/catalog/marki.aspx")
		if err != nil {
			log.Fatal("Failed to fetch url with links to new pages: %w", err)
		}
		var newPages []string
		for _, url := range urls {
			if !knownPages.Contains(url) {
				log.Printf("Discovered new page: %s\n", url)
				newPages = append(newPages, url)
			}
		}
		if len(newPages) == 0 {
			log.Println("No new pages found")
		}

		// Scan new pages
		if len(newPages) != 0 {
			newImages := make(map[string][]byte)
			for _, pageUrl := range newPages {
				log.Printf("Scanning %s\n", pageUrl)
				scraped, err := rusmarka.ScrapeStampsFromNewPage(pageUrl)
				if err != nil {
					log.Fatal(err)
				}
				stampsJson.Entries = append(stampsJson.Entries, scraped.Entries...)
				for _, entry := range scraped.Entries {
					log.Printf("Adding %+v\n", entry)
					addedNewStamps = true
				}
				for imagePath, imageBytes := range scraped.Images {
					newImages[imagePath] = imageBytes
					log.Printf("Adding image %s\n", imagePath)
				}
			}
			if addedNewStamps {
				// Sort entries
				stampsJson.SortEntries()
				// Save new images
				for imageName, imageBytes := range newImages {
					imagePath := path.Join(path.Dir(stampsJsonPath), imageName)
					err = os.WriteFile(imagePath, imageBytes, 0644)
					if err != nil {
						log.Fatalln(fmt.Errorf("failed to write image %s: %w", imagePath, err))
					}
				}
			}
		}
	}
	nStampCategoriesUpdated := 0
	if options.ScrapeCategories || addedNewStamps {
		nStampCategoriesUpdated, err = rusmarka.ScrapeAndUpdateCategories(stampsJson)
		if err != nil {
			log.Fatalln(fmt.Errorf("failed scraping categories: %w", err))
		}
		log.Printf("Updated categories for %d stamp(s)\n", nStampCategoriesUpdated)
	}
	if nStampCategoriesUpdated > 0 && addedNewStamps {
		err := stampsJson.SaveToFile(stampsJsonPath)
		if err != nil {
			log.Fatalln(err)
		}
		log.Println("Saved new stamps.json")
	}
	log.Println("Done!")
}