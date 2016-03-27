#!/usr/bin/env python

import requests
import numpy as np
import re
from bs4 import BeautifulSoup

from utils import cachelib


def get_url(url, cache=False, verbose=False):
    if verbose:
        print 'fetching ' + url + ' ...'
    
    if cache and cachelib.is_url_file_exist(url):
        return cachelib.read_url_file(url)

    r = requests.get(url)
    if r.status_code == 200:
        if verbose:
            print 'fetched page from ' + url
        if cache:
            cachelib.write_url_file(url, r.text)
        return r.text
    return None

# Parser utilities
def is_valid_external_url(external_url):
    return external_url != '#' # can not be sharp

def is_text_match_keywords(text, keywords, negative_keywords=[]):
    is_match = True
    for keyword in keywords:
        is_match = is_match and keyword.upper() in text.upper()
    for negative_keyword in negative_keywords:
        is_match = is_match and negative_keyword.upper() not in text.upper()
    return is_match

def get_root_url(url):
    url_parts = url.split('/')
    return url_parts[0] + '//' + url_parts[2] + '/'

def patch_external_url(external_url, main_url=''):
    if 'http' in external_url: # has "http" prefix
        return external_url
    if '#' in external_url:
        return main_url + external_url
    return get_root_url(main_url) + external_url

def find_all_external_links(url, verbose=False, keywords=[], negative_keywords=[]):
    if (verbose):
        print 'fetching ' + url + ' ...'
    
    main_url = url
    external_links = []

    html = get_url(url, cache=True, verbose=True)
    if html is None:
        print "Found None url: " + url
        return []

    bs_obj = BeautifulSoup(html, 'html.parser')
    for a_tag in bs_obj.findAll('a'):
        if 'href' in a_tag.attrs:
            url = a_tag.attrs['href']
            text = a_tag.get_text().strip()
            if (is_valid_external_url(url) and 
                is_text_match_keywords(text, keywords, negative_keywords)):
                # Then we can append url
                url = patch_external_url(url, main_url=main_url)
                external_links.append((url, text))

    return np.array(external_links)
