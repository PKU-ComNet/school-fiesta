#!/usr/bin/env python

import sys
import requests
import json
from pprint import pprint

from school import School, Program, SchoolCollection
from extractor import Extractor

class Crawler:
  """
  Main class for this dummy crawler
  """
  def __init__(self, dbfile):
    self.dbfile = dbfile
    self.data = None
    self.school_collection = None
    self.extractor = Extractor()

  def load(self):
    if self.data != None:
      print 'You have unsaved in-memory data, cannot load new data'
      exit(1)
    with open(self.dbfile, 'r') as f:
      self.data = json.load(f)
      self.school_collection = SchoolCollection(self.data['schools'])
    print 'Loaded %s json file, got %d schools' % (self.dbfile,
        self.school_collection.get_num_schools())

  def dump(self):
    if self.data == None:
      print 'Nothing to dump'
      exit(1)
    self.data = self.school_collection.toJSON()
    with open(self.dbfile, 'w') as f:
      json.dump(self.data, f)
    print 'Dumped %s json file' % self.dbfile

  def fetch(self, url):
    """
    Entrance for all kinds of HTTP requests
    """,
    is_ok,html = False,None
    try:
      response = requests.get(url, verify=False)
      if response.status_code == 200:
        html = response.text
        is_ok = True
      else:
        print >>sys.stderr, 'Error fetch'
    finally:
      return is_ok,html


  def fetch_program_text(self, url):
    """
    Just read the content from url, load <p> text only.
    I think this is the best heuristic method.
    """
    is_ok,html = self.fetch(url)
    html = html.strip()
    text = self.extractor.extract(html)
    return is_ok,text 

  # important public API
  def add_program(self, school_name, data, fetch_text=True, override_program=False):
    """
    Try to add a program to program list
    Currently I dont take care about the return value
    """
    if self.school_collection.is_school_exists(school_name) == False:
      print >>sys.stderr, "Should add school '%s' first" % school_name
      return None
    
    school = self.school_collection.find_school(school_name)
    if school.is_program_exists(data['name']):
      if override_program == False:
        return None

    prog = Program(data)
    if fetch_text:
      is_ok,text = self.fetch_program_text(prog.url)
      if is_ok:
        prog.text = text

    pprint(prog.toJSON())
    school.insert_program(prog)
    return None

if __name__ == '__main__':
  if len(sys.argv) <= 1:
    print 'usage: %s <test json>' % sys.argv[0]
    exit(1)

  crawler = Crawler(sys.argv[1])
  crawler.load()
  crawler.add_program(
      'Carnegie Mellon University', 
      {
        'name': 'Masters of Human-Computer Interaction', 
        'url':  'http://www.hcii.cmu.edu/academics/mhci',
        'dept': 'Human-Computer Interaction Institute'
      })
  crawler.dump()
