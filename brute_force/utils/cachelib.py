
import os
import re
import sys

CACHE_DIR = './cache'
FILE_PREFIX = 'FILE_'

# File System cache
def get_url_filename(url):
    url = re.sub('/', "", url)
    return CACHE_DIR + '/' + FILE_PREFIX + url + '.txt'

def is_url_file_exist(url):
    return os.path.isfile(get_url_filename(url))

def read_url_file(url):
    with open(get_url_filename(url), 'r') as f:
        return f.read().decode('utf8')

def write_url_file(url, html):
    f = open(get_url_filename(url), 'w+')
    f.write(html.encode('utf8'))
    f.close()