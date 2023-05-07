package sf

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	mapset "github.com/deckarep/golang-set/v2"
	"github.com/h2non/bimg"
	"os"
	"path"
	"runtime"
	"sf/internal/data"
	"sync"
)

const (
	ThumbnailSize              = 512
	ThumbnailsMetadataFileName = "_metadata.json"
)

func maxInt(a int, b int) int {
	if a > b {
		return a
	}
	return b
}

func makeThumbnail(image *bimg.Image) ([]byte, error) {
	size, err := image.Size()
	if err != nil {
		return nil, err
	}
	imageSize := maxInt(size.Width, size.Height)
	var newWidth, newHeight int
	if imageSize <= ThumbnailSize {
		newWidth = size.Width
		newHeight = size.Height
	} else {
		newWidth = size.Width * ThumbnailSize / imageSize
		newHeight = size.Height * ThumbnailSize / imageSize
	}
	return image.Process(bimg.Options{
		Width:   newWidth,
		Height:  newHeight,
		Quality: 100,
		Type:    bimg.WEBP,
	})
}

type ThumbnailTask struct {
	Metadata *data.ThumbnailsMetadata
	SrcDir   string
	SrcName  string
	DstDir   string
}

type ThumbnailTaskResult struct {
	Task        *ThumbnailTask
	SrcChecksum string
	DstName     string
	Error       error
	WasCached   bool
}

func computeSha256(bytes []byte) string {
	hash := sha256.New()
	hash.Write(bytes)
	return hex.EncodeToString(hash.Sum(nil))
}

func GenerateThumbnail(task *ThumbnailTask) *ThumbnailTaskResult {
	// Read the source image bytes
	srcPath := path.Join(task.SrcDir, task.SrcName)
	imageBytes, err := bimg.Read(srcPath)
	if err != nil {
		return &ThumbnailTaskResult{
			Task:  task,
			Error: fmt.Errorf("error reading image: %w", err),
		}
	}

	// Query thumbnail metadata
	srcChecksum := computeSha256(imageBytes)
	if entry := task.Metadata.FindBySrcChecksum(srcChecksum); entry != nil {
		return &ThumbnailTaskResult{
			Task:        task,
			SrcChecksum: srcChecksum,
			DstName:     entry.DstName,
			WasCached:   true,
		}
	}

	// Thumbnail was not computed before, computing it now
	thumbnailBytes, err := makeThumbnail(bimg.NewImage(imageBytes))
	if err != nil {
		return &ThumbnailTaskResult{
			Task:  task,
			Error: fmt.Errorf("error making thumbnail %w", err),
		}
	}

	// Compute destination file name & write result
	dstName := fmt.Sprintf("%s.webp", computeSha256(thumbnailBytes))
	dstPath := path.Join(task.DstDir, dstName)
	err = bimg.Write(dstPath, thumbnailBytes)

	// Add to metadata
	task.Metadata.Add(&data.ThumbnailMetadataEntry{
		SrcNames:    []string{task.SrcName},
		DstName:     dstName,
		SrcChecksum: srcChecksum,
	})

	return &ThumbnailTaskResult{
		Task:        task,
		SrcChecksum: srcChecksum,
		DstName:     dstName,
	}
}

func LoadLastThumbnailMetadata(dstDir string, errorIfAbsent bool) (*data.ThumbnailsMetadata, error) {
	metadata := data.NewThumbnailsMetadata()
	fileBytes, err := os.ReadFile(path.Join(dstDir, ThumbnailsMetadataFileName))
	if err != nil {
		if os.IsNotExist(err) && !errorIfAbsent {
			return metadata, nil
		}
		return nil, err
	}
	err = metadata.LoadFromBytes(fileBytes)
	if err != nil {
		return nil, err
	}
	return metadata, nil
}

func MakeImageThumbnails(srcDir string, dstDir string) error {
	files, err := os.ReadDir(srcDir)
	if err != nil {
		return nil
	}

	thumbnailTasks := make(chan *ThumbnailTask)
	resultsChan := make(chan *ThumbnailTaskResult, len(files))

	// Load metadata
	metadata, err := LoadLastThumbnailMetadata(dstDir, false)
	if err != nil {
		return err
	}

	// Start workers
	var wg sync.WaitGroup
	for i := 0; i < runtime.NumCPU(); i++ {
		wg.Add(1)
		go (func() {
			for task := range thumbnailTasks {
				resultsChan <- GenerateThumbnail(task)
			}
			wg.Done()
		})()
	}

	// Send jobs
	for _, file := range files {
		thumbnailTasks <- &ThumbnailTask{
			Metadata: metadata,
			SrcDir:   srcDir,
			SrcName:  file.Name(),
			DstDir:   dstDir,
		}
	}
	close(thumbnailTasks)
	wg.Wait()

	// Find unused files
	close(resultsChan)
	var validSrcNames []string
	var validSrcChecksums []string
	validDstNames := mapset.NewSet[string]()
	anythingChanged := false
	for result := range resultsChan {
		if !result.WasCached {
			anythingChanged = true
		}
		validSrcNames = append(validSrcNames, result.Task.SrcName)
		validSrcChecksums = append(validSrcChecksums, result.SrcChecksum)
		validDstNames.Add(result.DstName)
	}

	// Remove unused metadata & save metadata file
	metadataChanged := metadata.RemoveOldEntries(validSrcNames, validSrcChecksums)
	anythingChanged = anythingChanged || metadataChanged
	err = os.WriteFile(path.Join(dstDir, ThumbnailsMetadataFileName), metadata.ToBytes(), 0644)
	if err != nil {
		return err
	}

	// Remove old files
	dstFiles, err := os.ReadDir(dstDir)
	if err != nil {
		return err
	}
	for _, dstFile := range dstFiles {
		if dstFile.Name() != ThumbnailsMetadataFileName && !validDstNames.Contains(dstFile.Name()) {
			anythingChanged = true
			dstPath := path.Join(dstDir, dstFile.Name())
			err := os.Remove(dstPath)
			if err != nil {
				return fmt.Errorf("error deleting old file: %w", err)
			}
		}
	}

	if anythingChanged {
		return nil
	} else {
		return NoErrAlreadyUpToDate
	}
}