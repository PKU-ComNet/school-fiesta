#!/usr/bin/env python

import sys
from pprint import pprint

from crawler import Crawler

class Shell:
  def __init__(self, dbfile):
    self.crawler = Crawler(dbfile)

  def start(self):
    self.crawler.load()
    try:
      while True: 
        try:
          raw_command = raw_input('>> ')
          self.run_command(raw_command)
          self.crawler.dump()
        except KeyboardInterrupt:
          print 'Interrupted'
    except EOFError as e:
      print 'Finished'
    finally:
      self.crawler.dump()

  def parse_command(self, raw_command):
    cmd,rest = raw_command.split(' ', 1)
    if cmd == 'list':
      if rest == 'schools':
        return cmd, rest
      obj,rest = rest.split(' ', 1)
      if obj == 'programs':
        return cmd,obj,rest
      else:
        print >>sys.stderr, 'Error command: %s' % raw_command
        exit(1)
    elif cmd == 'add':
      sub,rest = rest.split(' ', 1)
      if sub == 'school':
        return cmd,sub,rest
      elif sub == 'program':
        return cmd,sub,rest
      else:
        print >>sys.stderr, 'Error command: %s' % raw_command
        exit(1)

  def run_command(self, raw_command):
    print 'Running command %s ...' % raw_command
    cmd_tuple = self.parse_command(raw_command)
    if cmd_tuple[0] == 'list':
      if cmd_tuple[1] == 'schools':
        names = self.crawler.school_collection.get_school_names()
        for idx,name in enumerate(names):
          print '[%3d]: \x1b[36m%s\x1b[0m' % (idx,name)
      elif cmd_tuple[1] == 'programs':
        school = self.crawler.school_collection.find_school_by_id(int(cmd_tuple[2]))
        school_name = school.name
        progs = self.crawler.school_collection.get_school_programs(school_name)
        print '\x1b[36m%s\x1b[0m' % school_name
        for idx,prog in enumerate(progs):
          print '[%3d] \x1b[33m%s\x1b[0m %s' % (idx, prog.name, prog.url)
    elif cmd_tuple[0] == 'add':
      if cmd_tuple[1] == 'school':
        self.crawler.school_collection.insert_school(cmd_tuple[2])
      elif cmd_tuple[1] == 'program':
        school = self.crawler.school_collection.find_school_by_id(int(cmd_tuple[2]))
        school_name = school.name
        print 'Add program to school %s ...' % school_name
        prog_data = {
            'name': raw_input('... \x1b[33mName:\x1b[0m ').strip(),
            'url':  raw_input('... \x1b[33mURL: \x1b[0m ').strip(),
            'dept': raw_input('... \x1b[33mDept:\x1b[0m ').strip()
        }
        self.crawler.add_program(school_name,prog_data,override_program=True)

if __name__ == '__main__':
  if len(sys.argv) <= 1:
    print 'usage: %s <dbfile>' % sys.argv[0]
    exit(1)
  
  shell = Shell(sys.argv[1])
  shell.start()
