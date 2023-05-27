package rusmarka

import (
	"errors"
	"github.com/gocolly/colly"
	"log"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"time"
)

var (
	regexpIdRange = regexp.MustCompile(`(\d+)-(\d+)`)
	regexpId      = regexp.MustCompile(`(\d+)`)
	regexPrice    = regexp.MustCompile(`\d+,\d+`)
)

const (
	maxStampsInRange = 40
)

type AdvancedCollyCollector struct {
	*colly.Collector
}

func newAdvancedCollyCollector() *AdvancedCollyCollector {
	collector := colly.NewCollector(colly.AllowURLRevisit())
	return &AdvancedCollyCollector{collector}
}

func (collector *AdvancedCollyCollector) visitWithRetry(pageUrl string) error {
	nRetriesLeft := 2
	for {
		err := collector.Visit(pageUrl)
		if err == nil {
			return nil
		}
		var urlErr *url.Error
		if errors.As(err, &urlErr) {
			if urlErr.Timeout() && nRetriesLeft > 0 {
				log.Printf("Timeout fetching %s, waiting for 30 seconds\n", pageUrl)
				time.Sleep(30 * time.Second)
				nRetriesLeft -= 1
				continue
			}
		}
		return err
	}
}

func makeRangeSlice(min, max int) []int {
	a := make([]int, max-min+1)
	for i := range a {
		a[i] = min + i
	}
	return a
}

func parseStampIds(s string) []int {
	if m := regexpIdRange.FindStringSubmatch(s); m != nil {
		start, err1 := strconv.Atoi(m[1])
		end, err2 := strconv.Atoi(m[2])
		if err1 != nil || err2 != nil || start >= end || (end-start+1) >= maxStampsInRange {
			return nil
		}
		return makeRangeSlice(start, end)
	} else if m := regexpId.FindString(s); m != "" {
		id, err := strconv.Atoi(m)
		if err != nil {
			return nil
		}
		return []int{id}
	} else {
		return nil
	}
}

func extractPrice(s string) float64 {
	priceStr := regexPrice.FindString(s)
	if priceStr != "" {
		priceStr = strings.ReplaceAll(priceStr, ",", ".")
		price, err := strconv.ParseFloat(priceStr, 64)
		if err != nil {
			return 0
		}
		return price
	}
	return 0
}
