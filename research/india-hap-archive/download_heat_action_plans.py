#!/usr/bin/env python3
"""Download the catalogue's PDFs. Requires Python 3 and requests.

Usage:
  python -m pip install requests
  python download_heat_action_plans.py India_Heat_Action_Plans_Verified.csv

Three retries means an initial attempt plus up to three retries PER URL.
Alternate URLs may be separated with |. Existing files are skipped only if
their header is a PDF header. Partial files never replace completed files.
"""
import argparse
import csv
import os
from pathlib import Path
import re
import sys
import time

try:
    import requests
except ImportError:
    raise SystemExit('Install the sole dependency: python -m pip install requests')

USER_AGENT = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
              'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36 '
              'HeatPlanResearchArchive/1.0')
TIMEOUT = 60
RETRIES = 3
DELAY = 2

def safe_component(value):
    value = re.sub(r'[^A-Za-z0-9._-]+', '_', value.strip()).strip('._')
    return value or 'Unknown'

def is_pdf(path):
    try:
        with Path(path).open('rb') as file:
            return file.read(5) == b'%PDF-'
    except OSError:
        return False

def candidate_urls(row):
    seen = set()
    for column in ('pdf_url', 'alternate_url', 'archive_org_url'):
        for url in row.get(column, '').split('|'):
            url = url.strip()
            if url and url not in seen:
                seen.add(url)
                yield url

def download_catalogue(csv_path, output_dir='heat_action_plans',
                       failure_path='failed_downloads.csv', session=None,
                       delay=DELAY, retries=RETRIES):
    counts = {'downloaded': 0, 'failed': 0, 'skipped': 0}
    failures = []
    own_session = session is None
    session = session or requests.Session()
    session.headers.update({'User-Agent': USER_AGENT, 'Accept': 'application/pdf,*/*;q=0.8'})
    try:
        with open(csv_path, encoding='utf-8-sig', newline='') as source:
            reader = csv.DictReader(source)
            required = {'id', 'state', 'pdf_url', 'alternate_url', 'archive_org_url'}
            missing = required.difference(reader.fieldnames or [])
            if missing:
                raise ValueError('CSV missing columns: ' + ', '.join(sorted(missing)))
            seen_destinations = set()
            for row in reader:
                ident = row.get('id', '').strip()
                target = Path(output_dir) / safe_component(row.get('state', 'Unknown')) / (safe_component(ident) + '.pdf')
                if not ident or target in seen_destinations:
                    counts['failed'] += 1
                    failures.append({'id': ident, 'title': row.get('title', ''),
                                     'attempted_urls': '', 'error': 'Empty ID or duplicate destination'})
                    continue
                seen_destinations.add(target)
                if is_pdf(target):
                    counts['skipped'] += 1
                    print('SKIP', ident, flush=True)
                    continue
                target.parent.mkdir(parents=True, exist_ok=True)
                temporary = target.with_suffix('.pdf.part')
                errors, attempted = [], []
                completed = False
                for url in candidate_urls(row):
                    attempted.append(url)
                    for attempt in range(retries + 1):
                        try:
                            with session.get(url, stream=True, timeout=TIMEOUT,
                                             allow_redirects=True) as response:
                                response.raise_for_status()
                                with temporary.open('wb') as destination:
                                    for chunk in response.iter_content(chunk_size=65536):
                                        if chunk:
                                            destination.write(chunk)
                            if not is_pdf(temporary):
                                raise ValueError('Not a real PDF: missing %PDF- header')
                            os.replace(temporary, target)
                            completed = True
                        except (requests.RequestException, OSError, ValueError) as error:
                            errors.append(f'{url} [attempt {attempt + 1}/{retries + 1}]: {error}')
                            try:
                                temporary.unlink(missing_ok=True)
                            except OSError:
                                pass
                        finally:
                            # All request attempts, retries and fallbacks are spaced.
                            time.sleep(delay)
                        if completed:
                            break
                    if completed:
                        break
                if completed:
                    counts['downloaded'] += 1
                    print('OK  ', ident, flush=True)
                else:
                    counts['failed'] += 1
                    failures.append({'id': ident, 'title': row.get('title', ''),
                                     'attempted_urls': ' | '.join(attempted),
                                     'error': ' | '.join(errors) or 'No downloadable URL in CSV'})
                    print('FAIL', ident, flush=True)
    finally:
        if own_session:
            session.close()
        failure_file = Path(failure_path)
        failure_file.parent.mkdir(parents=True, exist_ok=True)
        with failure_file.open('w', encoding='utf-8-sig', newline='') as log:
            writer = csv.DictWriter(log, fieldnames=['id', 'title', 'attempted_urls', 'error'])
            writer.writeheader()
            writer.writerows(failures)
    print('\nSummary: downloaded={downloaded} / failed={failed} / skipped={skipped}'.format(**counts))
    print('Failure log:', failure_path)
    return counts

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('csv', nargs='?', default='India_Heat_Action_Plans_Verified.csv')
    parser.add_argument('--output', default='heat_action_plans')
    parser.add_argument('--failures', default='failed_downloads.csv')
    args = parser.parse_args()
    try:
        counts = download_catalogue(args.csv, args.output, args.failures)
    except (OSError, ValueError) as error:
        parser.exit(2, f'Error: {error}\n')
    return 1 if counts['failed'] else 0

if __name__ == '__main__':
    sys.exit(main())
