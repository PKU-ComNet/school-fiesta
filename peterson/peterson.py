__author__ = 'sidxiong'

import requests
import json
import re
from bs4 import BeautifulSoup

base_url = "https://www.petersons.com"
params = {}
params['q'] = "Cornell University Computer Science"


class Profile(object):
    def __init__(self, top_school_name, school_name, profile_page_url):
        self.top_school_name = top_school_name
        self.school_name = school_name
        self.profile_page_url = profile_page_url

    def set_school_links(self, link_list):
        """
        school link format: [{"name": "Peking University", "url": "www.pku.edu.cn"}, ...]
        """
        self.school_links = link_list

    def persistent(self):
        with open(self.top_school_name + "_" + self.school_name + ".info", 'wb') as f:
            f.write("top school name: " + self.top_school_name + '\n\n')
            f.write("school name: " + self.school_name + '\n\n')
            f.write("profile page url: " + self.profile_page_url + '\n\n')
            f.write("school links: \n")
            for sl in self.school_links:
                json.dump(sl, f)
                f.write('\n')


def fetch_profile_list(debug=False):
    if debug:
        with open("search.test", 'r') as f:
            raw = f.read()
        s = re.findall('<script type=\"text\/javascript\">.*?<\/script>', raw, re.S)
    else:
        r = requests.get(base_url + "/graduate-schools/SearchResults.aspx", params=params)
        with open('search.test', 'wb') as f:
            f.write(r.text.encode('utf8'))
        s = re.findall('<script type=\"text\/javascript\">.*?<\/script>', r.text, re.S)

    for ss in s:
        if "originalResults" in ss:
            js_str = re.findall('{\"results\".*?var', ss, re.S)

            # TODO
            # need some optimization
            js_str = js_str[0][:-3].strip()[:-1].replace("\\'", "\\\"")

            json_obj = json.loads(js_str.encode('utf8'))

    return [Profile(profile['topLevelSchoolName'], profile['schoolName'], base_url + profile['profilePageUrl'])
            for profile in json_obj['results'] if profile['isClient'] is True]


def fetch_school_links(profile, debug=False):
    if debug:
        # ignore profile param
        with open("profile.test", 'r') as f:
            r = f.read()
    else:
        r = requests.get(profile.profile_page_url)
        with open('profile.test', 'wb') as f:
            f.write(r.text.encode('utf8'))
        r = r.text

    bs = BeautifulSoup(r, "html.parser")
    li_items = bs.findAll('div', {'class': 'school-links client'})[0].findAll('li')
    school_link_list = [{"name": school_link.get_text().strip(), "url": school_link.findAll('a')[0].attrs['href']}
                        for school_link in li_items]

    p.set_school_links(school_link_list)


if __name__ == '__main__':
    pl = fetch_profile_list(debug=False)
    for p in pl:
        # if "computer" in p.profile_page_url:
            print '--profile page url'
            print p.profile_page_url
            print "-----"
            fetch_school_links(p, debug=False)
            p.persistent()
