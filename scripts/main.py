import argparse
import os
import re
import sys
import progressbar
from PIL import Image

import data_fetch
from stamps_data import StampsJson


def update_presence(args):
    stamps_json_path = os.path.join(args.datadir, 'stamps.json')
    sys.stderr.write('Loading stamps.json\n')
    stamps_json = StampsJson.load(stamps_json_path)
    sys.stderr.write('Fetching position page links from rusmarka\n')
    all_position_ids = data_fetch.find_all_position_ids()
    sys.stderr.write('Loading all positions & parsing buy offers\n')
    buy_offers_lists = [data_fetch.load_buy_offers(pos_id) for pos_id in progressbar.progressbar(all_position_ids)]
    buy_offers = [bo for l in buy_offers_lists for bo in l]
    sys.stderr.write('Updating stamps.json\n')
    present_stamp_ids = set(stamp_id for o in buy_offers if o.typ == 'Чистый' for stamp_id in o.stamp_ids)
    for entry in stamps_json.entries:
        entry.present = (entry.id in present_stamp_ids)
    stamps_json.save(stamps_json_path)

    sys.stderr.write('Looking for new position pages\n')
    known_pages = set(entry.page for entry in stamps_json.entries)
    # Ignore old position ids because some stamps were duplicated on different positions
    new_position_ids = {i for i in all_position_ids if
                        (data_fetch.position_page_url(i) not in known_pages and i > 38226)}
    if len(new_position_ids) != 0:
        sys.stderr.write(f'New position ids: {new_position_ids}\n')
    else:
        sys.stderr.write(f'No new position ids')


def update_images(args):
    stamps_json_path = os.path.join(args.datadir, 'stamps.json')
    sys.stderr.write('Loading stamps.json\n')
    stamps_json = StampsJson.load(stamps_json_path)
    sys.stderr.write('Scanning images directory\n')
    images_dir = os.path.join(args.datadir, 'images')
    image_files = os.listdir(images_dir)
    id2image = {}
    for image_file in image_files:
        m = re.match(r'(\d+).png', image_file)
        mm = re.match(r'(\d+)-(\d+).png', image_file)
        if m:
            stamp_id = int(m.group(1))
            if stamp_id in id2image:
                sys.stderr.write(f'Warning: {image_file} duplicates {id2image[stamp_id]} for №{stamp_id}\n')
            id2image[stamp_id] = f"images/{image_file}"
        elif mm:
            start_id = int(mm.group(1))
            end_id = int(mm.group(2))
            for stamp_id in range(start_id, end_id + 1):
                if stamp_id in id2image:
                    sys.stderr.write(f'Warning: {image_file} duplicates {id2image[stamp_id]} for №{stamp_id}\n')
                id2image[int(stamp_id)] = f"images/{image_file}"
        else:
            sys.stderr.write(f'Warning: unknown file {image_file}\n')
    sys.stderr.write('Updating stamps.json\n')
    for entry in stamps_json.entries:
        entry.image = id2image.get(entry.id)
    stamps_json.save(stamps_json_path)


def resize_images(args):
    sys.stderr.write('Scanning images directory & resizing\n')
    images_dir = os.path.join(args.datadir, 'images')
    image_files = os.listdir(images_dir)
    for image_file in image_files:
        full_path = os.path.join(images_dir, image_file)
        im = Image.open(full_path)
        im.thumbnail((args.size, args.size))
        im.save(full_path)


def main(args):
    progressbar.streams.wrap_stderr()
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers()
    update_presence_parser = subparsers.add_parser('update-presence')
    update_presence_parser.add_argument('datadir', type=str)
    update_presence_parser.set_defaults(func=update_presence)
    update_images_parser = subparsers.add_parser('update-images')
    update_images_parser.add_argument('datadir', type=str)
    update_images_parser.set_defaults(func=update_images)
    resize_images_parser = subparsers.add_parser('resize-images')
    resize_images_parser.add_argument('datadir', type=str)
    resize_images_parser.add_argument('size', type=int)
    resize_images_parser.set_defaults(func=resize_images)
    parsed_args = parser.parse_args(args)
    parsed_args.func(parsed_args)


if __name__ == '__main__':
    main(sys.argv[1:])
