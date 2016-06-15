#!/usr/bin/env python

import sys
import json
from pprint import pprint
import requests

from extractor import Extractor
from crawler import Crawler

def crawl_school_programs(data):
  programs = []

  for program in data:
    pprint(program)
    if program.has_key('text'):
      programs.append(program)
      continue
    url = program['url']

    print 'requesting url %s ...' % url
    r = requests.get(url, verify=False)
    if r.status_code == 200:
      html = r.text
      extractor = Extractor()
      text = extractor.extract(html)
      if len(text.strip()) != 0:
        program['text'] = text
    else:
      print 'Error code'
    
    programs.append(program)
  
  return programs

def crawl(data):
  for school in data:
    for key in data[school]:
      if key == 'programs':
        data[school][key] = crawl_school_programs(data[school][key])
  return data

def shell(data):
  try:
    while True:
      cmd = raw_input('> ').strip()
      if cmd == 'add_program':
        school = raw_input('School: ').strip()
        if not data.has_key(school):
          print 'No such school'
          continue
        # TODO take care of the duplicate program
        name = raw_input('Program name: ').strip()
        url = raw_input('Program url: ').strip()
        department = raw_input('Department: ').strip()
        program = {}
        program['name'] = name
        program['url'] = url
        program['department'] = department
        pprint(program)
  except EOFError:
    return 


if __name__ == '__main__':
  if len(sys.argv) <= 1:
    print 'usage: %s <json file> <command>' % sys.argv[0]
    exit(1)

  file_name = sys.argv[1]
  crawler = Crawler(file_name)
  crawler.load()

  if len(sys.argv) > 2:
    if sys.argv[2] == 'shell':
      print 'Opening shell ..'
      shell(crawler.data)

  crawler.dump()
