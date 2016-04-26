#!/usr/bin/env python

import os
import sys
import requests
from requests import ConnectionError, HTTPError, Timeout
from bs4 import BeautifulSoup

def get(url,verbose=True):
  if verbose:
    print 'Requesting %s ...' % url
  try:
    r = requests.get(url)
    if r.status_code != 200:
      return False,None
    return True,r
  except ConnectionError as e:
    print 'Connection error: ' + e.strerror
    return False,None
  except Timeout as e:
    print 'Timeout: ' + e.strerror
    return False,None

def is_program_link(link):
  text = link.get_text()
  # rule for CMU
  if 'Master of' in text:
    return True
  return False

# read all external urls, decide the type by link text
def parse_all_external_urls(html):
  bsobj = BeautifulSoup(html, 'lxml')
  link_list = bsobj.findAll('a')
  program_link_list = []
  for link in link_list:
    if is_program_link(link):
      program_link_list.append(link)
  
  return (program_link_list,)

def parse_bottom_url(url):
  is_ok, res = get(url)
  if is_ok:
    bsobj = BeautifulSoup(res.text)
    article = bsobj.find('article')
    if article == None:
      return url, None
    return url, article.get_text()

if __name__ == '__main__':
  is_ok, res = get('http://www.cs.cmu.edu/masters-programs')
  if is_ok:
    link_lists = parse_all_external_urls(res.text)
    program_link_list = link_lists[0]
    print 'Found %d links for program' % len(program_link_list) 
    for program_link in program_link_list:
      print program_link.get_text()
      print parse_bottom_url(program_link.get('href'))
