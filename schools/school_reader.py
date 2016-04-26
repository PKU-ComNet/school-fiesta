#!/usr/bin/env python

import os
import sys
import csv
import requests
from requests import ConnectionError, HTTPError, Timeout
import time

def check_url_available(url):
  try:
    r = requests.get(url, verify=False)
    return r.status_code == 200, r.status_code
  except ConnectionError as e:
    print 'Connection error: ' + e.strerror
    return False
  except Timeout as e:
    print 'Connection error: ' + e.strerror
    return False  

class Program:
  
  def __init__(self, name, urls):
    self.name = name
    self.urls = urls

  def __str__(self):
    return '%s <%s>' % self.name,self.urls

  def __repr__(self):
    return self.__str__()

class School:
  
  def __init__(self, name, urls, programs):
    self.name = name
    self.urls = urls
    self.programs = programs

  def __str__(self):
    return '%s <%s> %d:%s' % (self.name,self.urls,len(self.programs),self.programs)

  def __repr__(self):
    return self.__str__()

  def is_url_available(self, verbose=False):
    is_all_available = True
    for idx,url in enumerate(self.urls):
      is_available, status_code = check_url_available(url)
      # Output debug information
      if verbose:
        if is_available:
          print '%s is available' % url
        else:
          print 'Error in %s: %d' % url,status_code
      is_all_available = is_available and is_all_available

    return is_all_available

class SchoolCollection(list):

    def __init__(self):
      # an empty school list
      self.schools = []

    def append(self, school):
      self.schools.append(school)

    def __str__(self):
      s = ''
      for idx,school in enumerate(self.schools):
        s += '[%4d]\t%s\n' % (idx,school)
      return s

    def __repr__(self):
      return self.__str__()

    def __getitem__(self, key):
      return self.schools[key]

    def check_url_availability(self):
      total_time = 0.0
      not_available_schools = []
      for idx,school in enumerate(self.schools):
        print '[%4d] Checking %s => %s ...' % (idx, school.name, school.urls)
        tic = time.time()
        is_available = school.is_url_available()
        toc = time.time()
        total_time += toc-tic
        if is_available == False:
          not_available_schools.append(school)
    
      num_schools = len(self.schools)
      num_not_available_schools = len(not_available_schools)
      print 'Availability report:'
      print 'Availability %4.2lf%%' % (1.0-float(num_not_available_schools)/num_schools)
      print 'Average response time %lfs' % (total_time/num_schools)

if __name__ == '__main__':
  print 'School CSV File Reader'
  if len(sys.argv) <= 1:
    print 'Usage: %s [file_name]' % sys.argv[0]
    exit(1)

  file_name = sys.argv[1]
  print 'Reading file: %s' % file_name

  school_collection = SchoolCollection()

  # Reference: https://docs.python.org/2/library/csv.html
  with open(file_name, 'r') as csvfile:
    school_reader = csv.reader(csvfile, delimiter=',')
    is_fst_line = True
    for row in school_reader:
      # skip first line(headers)
      if is_fst_line:
        is_fst_line = False
        continue

      # collect and wash data
      school_name = row[0].strip()
      # URLs
      raw_urls = row[1].strip().split(' ')
      urls = []
      for url in raw_urls:
        url = url.strip()
        if len(url) == 0:
          continue
        if url[:5] == 'https':
          url = url[:4] + url[5:]
        urls.append(url)

      # Programs
      raw_programs = filter(lambda x: len(x.strip()) != 0, row[2:])
      raw_programs = map(lambda x: x.strip(), raw_programs)
      programs = []
      # A nasty snippet
      for raw_program in raw_programs:
        # a raw_program string could contain a name and a http string
        strs = raw_program.split(':')
        program_urls = []
        program_name = strs[0].strip()
        if len(strs) > 1:
          urls_str = ''.join(strs[1:])
          tmp_urls = urls_str.strip().split(' ')
          for url in tmp_urls:
            url = url.strip()
            if len(url) == 0:
              continue
            if url[:5] == 'https':
              url = url[:4] + url[5:]
            program_urls.append(url)

        programs.append(Program(program_name, program_urls)) 

      # new school object
      school = School(school_name, urls, programs)
      school_collection.append(school)

    # print 'Schools parsed: '
    # print school_collection
    school_collection.check_url_availability() 
