package rusmarka

import (
	"fmt"
	"github.com/gocolly/colly"
	"github.com/h2non/bimg"
	"github.com/samber/lo"
	"io"
	"log"
	"net/http"
	"sf/internal/data"
	"strings"
	"time"
)

type ScrapedStamps struct {
	Entries []*data.StampEntry
	Images  map[string][]byte
}

type scrapedPagePart struct {
	title           string
	titleWithoutIds string
	ids             []int
	imagePngBytes   []byte
}
type scrapedPage struct {
	title string
	parts []scrapedPagePart
	items []RusmarkaItem
}

func downloadImage(url string) ([]byte, error) {
	// Make http request
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error downloading %s: http code %d", url, resp.StatusCode)
	}

	// Download response body
	bytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error downloading image from %s: %w", url, err)
	}

	// Convert image to png
	image := bimg.NewImage(bytes)
	pngBytes, err := image.Process(bimg.Options{
		Quality: 100,
		Type:    bimg.PNG,
	})
	if err != nil {
		return nil, fmt.Errorf("error converting image to png: %w", err)
	}
	return pngBytes, nil
}

func scrapePageParts(pageUrl string) (*scrapedPage, error) {
	var pageTitle string
	var items []RusmarkaItem
	parts := make([]scrapedPagePart, 0)
	collector := newAdvancedCollyCollector()
	collector.OnHTML("html", func(html *colly.HTMLElement) {
		pageTitle = strings.TrimSpace(html.DOM.Find("title").Text())
		items = ExtractRusmarkaItems(html)
		html.ForEach("h2.marka-post-title", func(index int, h2 *colly.HTMLElement) {
			stampIds := parseStampIds(h2.Text)
			if stampIds != nil {
				h2text := strings.TrimSpace(h2.Text)
				part := scrapedPagePart{
					title:           h2text,
					titleWithoutIds: h2text,
					ids:             stampIds,
				}
				imgAfterTitle := h2.DOM.Parent().Next().Find("img")
				imageUrl, ok := imgAfterTitle.Attr("data-zoom-image")
				if ok && len(imageUrl) >= 1 {
					if imageUrl[0] == '/' {
						imageUrl = "https://rusmarka.ru" + imageUrl
					}
					imageBytes, err := downloadImage(imageUrl)
					if err != nil {
						log.Printf("error downloaing image %s: %s", imageUrl, err)
					} else {
						part.imagePngBytes = imageBytes
					}
				}
				parts = append(parts, part)
			}
		})
	})
	err := collector.visitWithRetry(pageUrl)
	if err != nil {
		return nil, err
	}
	if pageTitle == "" || len(parts) == 0 {
		return nil, nil
	}
	return &scrapedPage{
		title: pageTitle,
		parts: parts,
		items: items,
	}, nil
}

func ScrapeStampsFromNewPage(pageUrl string) (*ScrapedStamps, error) {
	page, err := scrapePageParts(pageUrl)
	if err != nil {
		return nil, err
	}

	idsOnPage := lo.Uniq(lo.FlatMap(page.parts, func(part scrapedPagePart, index int) []int {
		return part.ids
	}))

	var knownStampIds []int
	scrapedStamps := &ScrapedStamps{
		Entries: make([]*data.StampEntry, 0),
		Images:  make(map[string][]byte),
	}
	for _, part := range page.parts {
		// Don't add the same stamp id multiple times
		alreadyKnown := false
		for _, id := range part.ids {
			if lo.Contains(knownStampIds, id) {
				alreadyKnown = true
			}
			knownStampIds = append(knownStampIds, id)
		}
		if alreadyKnown {
			continue
		}
		// Generate stamp Entries
		for _, id := range part.ids {
			currentYear := time.Now().Year()
			name := page.title
			if len(idsOnPage) != 1 {
				name = fmt.Sprintf("%s. %s.", page.title, part.title)
			}
			value := 0.0
			for _, item := range page.items {
				if lo.Contains(item.ids, id) {
					value = item.price / float64(len(item.ids))
					break
				}
			}

			var imageFileName string
			if len(part.ids) == 1 {
				imageFileName = fmt.Sprintf("images/%d.png", part.ids[0])
			} else {
				imageFileName = fmt.Sprintf("images/%d-%d.png", part.ids[0], part.ids[len(part.ids)-1])
			}

			entry := &data.StampEntry{
				Id:         id,
				Page:       pageUrl,
				Value:      &value,
				Year:       &currentYear,
				Categories: []string{},
				Name:       name,
			}
			if part.imagePngBytes != nil {
				entry.Image = &imageFileName
				scrapedStamps.Images[imageFileName] = part.imagePngBytes
			}
			scrapedStamps.Entries = append(scrapedStamps.Entries, entry)
		}
	}
	return scrapedStamps, err
}
