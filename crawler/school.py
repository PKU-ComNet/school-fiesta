#!/usr/bin/env python

class Program:
  def __init__(self, data):
    self.name = data['name']
    self.url  = data['url']
    self.dept = data['dept']
    if data.has_key('text'):
      self.text = data['text']
 
  def toJSON(self):
    d = {}
    d['name'] = self.name
    d['url']  = self.url
    d['dept'] = self.dept
    d['text'] = self.text
    return d

class School:
  """
  Coarse ORM of school
  """
  def __init__(self, data):
    self.name = data['name']
    if data.has_key('progs'):
      self.progs = map(lambda d: Program(d), data['progs'])
    else:
      self.progs = []

  def is_program_exists(self, name):
    return self.find_program(name) != None

  def find_program(self, name):
    for prog in self.progs:
      if prog.name == name:
        return prog
    return None

  def insert_program(self, prog, override=False):
    for idx, p in enumerate(self.progs):
      if p.name == prog.name:
        if override:
          self.progs[idx] = prog
        return None
    self.progs.append(prog)
    return None

  def list_programs(self):
    return self.progs

  def toJSON(self):
    d = {}
    d['name'] = self.name
    d['progs'] = map(lambda x: x.toJSON(), self.progs)
    return d

class SchoolCollection:
  """
  A collection of schools, has hyper operation supported
  """
  def __init__(self, data):
    self.schools = []
    for school_data in data:
      school = School(school_data)
      self.schools.append(school)

  def get_num_schools(self):
    return len(self.schools)

  def is_school_exists(self, school_name):
    return self.find_school(school_name) != None

  def find_school(self, school_name):
    for school in self.schools:
      if school.name == school_name:
        return school
    return None

  def find_school_by_id(self, idx):
    if idx < len(self.schools):
      return self.schools[idx]
    return None

  def get_school_names(self):
    names = []
    for school in self.schools:
      names.append(school.name)
    return names

  def get_school_programs(self, school_name):
    school = self.find_school(school_name)
    return school.list_programs()

  def insert_school(self, school_name):
    if self.is_school_exists(school_name):
      return False
    self.schools.append(
        School({ 'name': school_name, 'progs': [] }))
    return True

  def toJSON(self):
    d = {}
    d['schools'] = map(lambda x: x.toJSON(), self.schools)
    return d
